/**
 * UI 帮助界面模块
 * 
 * 从ui.js拆分出的独立界面渲染模块
 * 包含：游戏帮助界面
 */

/**
 * 渲染帮助界面
 * 绑定到UI对象调用：UIHelp.renderHelpScreen.call(UI)
 */
export function renderHelpScreen() {
    this.elements.gameContainer.innerHTML = `
        <div style="width: 100%; height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #1a2a3a, #2a3a4a); position: relative;">
            
            <!-- 背景图片 -->
            <div style="
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: linear-gradient(135deg, #1a0500 0%, #3d1500 30%, #662200 60%, #1a0500 100%);
                opacity: 0.06;
                filter: blur(3px);
                z-index: 0;
                pointer-events: none;
            "></div>
            
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                background: rgba(0, 0, 0, 0.5);
                border-bottom: 2px solid #446677;
                position: relative;
                z-index: 1;
            ">
                <h2 style="color: #ffd700; font-size: 26px;">❓ 游戏帮助</h2>
                <div onclick="Game.closeHelpPanel()" style="
                    padding: 10px 20px;
                    background: #553333;
                    border: 1px solid #775555;
                    border-radius: 8px;
                    color: #ffcccc;
                    cursor: pointer;
                    font-size: 15px;
                    display: inline-block;
                ">关闭</div>
            </div>
            
            <div style="flex: 1; padding: 30px; overflow-y: auto; position: relative; z-index: 1;">
                <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 25px;">
                    
                    <!-- 游戏简介 -->
                    <div style="
                        padding: 20px;
                        background: rgba(30, 40, 60, 0.8);
                        border: 2px solid #446677;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">🎮 游戏简介</h3>
                        <p style="color: #cccccc; line-height: 1.8; font-size: 14px;">
                            这是一个基于《全职法师》世界观的开放世界 RPG 游戏。你将扮演一名刚觉醒魔法的新生，在博城开始你的魔法之旅。
                            你可以自由探索、修炼、交友、冒险。你的选择会影响这个世界，影响你和 NPC 之间的关系，甚至改变某些人的命运。
                        </p>
                    </div>
                    
                    <!-- 基本操作 -->
                    <div style="
                        padding: 20px;
                        background: rgba(30, 40, 60, 0.8);
                        border: 2px solid #446677;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">🖱️ 基本操作</h3>
                        <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                            <li><strong>地图界面</strong>：点击行动按钮执行操作，点击地点移动</li>
                            <li><strong>战斗界面</strong>：点击技能按钮释放魔法，点击防御/道具/逃跑</li>
                            <li><strong>对话界面</strong>：点击选项进行对话选择</li>
                            <li><strong>右侧菜单</strong>：查看角色、背包、任务、情报、声望等</li>
                        </ul>
                    </div>
                    
                    <!-- 核心系统 -->
                    <div style="
                        padding: 20px;
                        background: rgba(30, 40, 60, 0.8);
                        border: 2px solid #446677;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">⚔️ 战斗系统</h3>
                        <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                            <li><strong>星子引导</strong>：魔法不是瞬发，需要引导时间，引导中可以被打断</li>
                            <li><strong>元素克制</strong>：每个元素有独特的战斗风格和克制关系</li>
                            <li><strong>状态效果</strong>：灼烧、冻结、麻痹、减速、中毒等</li>
                            <li><strong>精英怪</strong>：10%概率遇到精英怪，属性提升50%，奖励翻倍</li>
                            <li><strong>死亡惩罚</strong>：掉10%经验、掉20%金币、30%概率掉一个物品</li>
                        </ul>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        background: rgba(30, 40, 60, 0.8);
                        border: 2px solid #446677;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">⏰ 时间与每日行动</h3>
                        <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                            <li><strong>时间系统</strong>：每个行动消耗时间，一天分为多个时段，特定时段有课程</li>
                            <li><strong>每日行动次数</strong>：v0.99.0替代体力系统，修炼/学习/猎魔/探索每日1次高效，之后递减</li>
                            <li><strong>修炼递减</strong>：每日第1次100%经验，2-3次70%，4次后50%（含三步塔）</li>
                            <li><strong>学习递减</strong>：每日第1次100%经验，2-3次70%，4次后50%（上课+图书馆）</li>
                            <li><strong>猎魔递减</strong>：每日第1次100%奖励，2-3次70%，4次后50%，连续猎魔会疲劳</li>
                            <li><strong>探索递减</strong>：每日第1次有随机事件+100%收益，2-3次事件减半+70%收益，4次后无事件+50%收益</li>
                            <li><strong>休息恢复</strong>：休息可以恢复 HP、MP，新的一天重置每日行动次数</li>
                            <li><strong>移动零消耗</strong>：地点之间旅行只消耗0.5小时</li>
                            <li><strong>大事件</strong>：特定天数会触发大事件，提前准备很重要</li>
                        </ul>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        background: rgba(30, 40, 60, 0.8);
                        border: 2px solid #446677;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">💬 NPC 与关系</h3>
                        <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                            <li><strong>关系系统</strong>：好感、信任、熟悉度三维关系，14个关系等级</li>
                            <li><strong>对话树</strong>：不同选择有不同结果，会影响关系</li>
                            <li><strong>NPC 分布</strong>：不同地点有不同的 NPC，去对的地方才能找到人</li>
                            <li><strong>情报收集</strong>：和 NPC 对话可以获得各种情报和线索</li>
                        </ul>
                    </div>
                    
                    <div style="
                        padding: 20px;
                        background: rgba(30, 40, 60, 0.8);
                        border: 2px solid #446677;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #88ccff; font-size: 20px; margin-bottom: 12px;">⭐ 势力声望</h3>
                        <ul style="color: #cccccc; line-height: 2; font-size: 14px; padding-left: 20px;">
                            <li><strong>5 大势力</strong>：天澜魔法高中、穆氏家族、猎魔者公会、魔法协会、黑教廷</li>
                            <li><strong>7 个等级</strong>：仇恨、敌对、冷淡、中立、友好、尊敬、崇拜</li>
                            <li><strong>声望效果</strong>：商店折扣、任务奖励加成、考核奖励加成等</li>
                            <li><strong>提升声望</strong>：完成势力相关的任务、帮助 NPC 等</li>
                        </ul>
                    </div>
                    
                    <!-- 小技巧 -->
                    <div style="
                        padding: 20px;
                        background: rgba(60, 50, 30, 0.8);
                        border: 2px solid #776644;
                        border-radius: 12px;
                    ">
                        <h3 style="color: #ffcc66; font-size: 20px; margin-bottom: 12px;">💡 游戏小技巧</h3>
                        <ul style="color: #ddddcc; line-height: 2; font-size: 14px; padding-left: 20px;">
                            <li>多和 NPC 聊天，可以获得情报和任务</li>
                            <li>注意收集情报，大事件来临前会有各种暗示</li>
                            <li>每日各类行动第1次效率最高，之后递减，高效期很快做完，可以专心探索剧情</li>
                            <li>战斗时注意元素克制，用对元素事半功倍</li>
                            <li>提升势力声望可以获得商店折扣和更多奖励</li>
                            <li>探索不同地点，会遇到不同的 NPC 和事件</li>
                            <li>游戏会自动保存，不用担心进度丢失</li>
                        </ul>
                    </div>
                    
                </div>
            </div>
        </div>
    `;
}

// 导出模块集合
export const UIHelp = {
    renderHelpScreen
};

export default UIHelp;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIHelp = UIHelp;
}
