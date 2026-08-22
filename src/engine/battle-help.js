/**
 * 战斗系统 - 帮助说明模块
 * 
 * 从battle.js拆分出的独立帮助说明模块
 * 包含：显示战斗帮助（showHelp）
 */

export function showHelp() {
        const helpHtml = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.85);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            " onclick="if(event.target === this) BattleSystem.closeHelp()">
                <div style="
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 2px solid #4a4a8a;
                    border-radius: 16px;
                    padding: 24px;
                    overflow-y: auto;
                    color: #fff;
                ">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #ffd700; margin: 0; font-size: 24px;">⚔️ 战斗帮助</h2>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">📋 基本规则</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li>回合制战斗，速度高的先行动</li>
                            <li>HP降为0则战斗失败</li>
                            <li>使用魔法需要消耗MP</li>
                            <li>高阶魔法需要引导多回合</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">🎮 行动选项</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li><b style="color: #ffaa66;">普通攻击</b>：无消耗，基础物理伤害</li>
                            <li><b style="color: #66aaff;">释放魔法</b>：消耗MP，伤害/治疗/buff/debuff</li>
                            <li><b style="color: #66ff66;">防御</b>：防御力翻倍，受到伤害减半</li>
                            <li><b style="color: #ffcc66;">使用道具</b>：消耗道具，恢复/解除状态/增益</li>
                            <li><b style="color: #ff6666;">逃跑</b>：有概率逃离战斗</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">⚡ 元素克制</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">克制关系：造成150%伤害，被克制只造成70%伤害</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                <span style="padding: 4px 8px; background: #ff664422; border-radius: 4px;">🔥火 → ❄️冰</span>
                                <span style="padding: 4px 8px; background: #66aaff22; border-radius: 4px;">❄️冰 → 💨风</span>
                                <span style="padding: 4px 8px; background: #88ffcc22; border-radius: 4px;">💨风 → 🪨土</span>
                                <span style="padding: 4px 8px; background: #aa884422; border-radius: 4px;">🪨土 → ⚡雷</span>
                                <span style="padding: 4px 8px; background: #ffdd4422; border-radius: 4px;">⚡雷 → 💧水</span>
                                <span style="padding: 4px 8px; background: #66bbff22; border-radius: 4px;">💧水 → 🔥火</span>
                                <span style="padding: 4px 8px; background: #ffffcc22; border-radius: 4px;">✨光 ↔ 🌑暗</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">💥 元素反应</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">特定元素与状态结合会触发强力反应：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><b style="color: #ff9944;">蒸发</b>：火 + 潮湿 → 伤害+30%</li>
                                <li><b style="color: #ffaa66;">融化</b>：火 + 冻结 → 伤害+30%</li>
                                <li><b style="color: #ffdd44;">感电</b>：雷 + 潮湿 → 伤害+20%，附加麻痹</li>
                                <li><b style="color: #88ddff;">冻结</b>：冰 + 潮湿 → 伤害+20%，附加冻结</li>
                                <li><b style="color: #aa88ff;">超导</b>：雷 + 冻结 → 降低防御</li>
                                <li><b style="color: #88cc88;">结晶</b>：土 + 元素 → 产生护盾</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">🔮 精神力与引导</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>高阶魔法需要引导多回合才能释放</li>
                                <li>精神力越高，引导速度越快</li>
                                <li>攻击有概率打断敌人引导（精神力对抗）</li>
                                <li>精神力越高，越不容易被打断</li>
                                <li>控制效果（麻痹/冻结/眩晕）受精神力抵抗</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #ff9966; margin-bottom: 8px; font-size: 16px;">⚡ 打断概率系统（v2.9.0）</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">施法速度体现在<b style="color:#ff9966;">被打断概率</b>上，不是回合引导：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><b style="color:#88ff88;">初阶魔法</b>：打断概率5-15%（几乎瞬发）</li>
                                <li><b style="color:#ffcc66;">中阶魔法</b>：打断概率20-40%</li>
                                <li><b style="color:#ff6644;">高阶魔法</b>：打断概率45-70%</li>
                                <li>被打断后魔法失败，损失50%MP</li>
                            </ul>
                            <p style="margin: 8px 0 4px 0;"><b style="color:#66ccff;">境界压制减免</b>：境界越高，对低阶魔法掌控越强：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>中阶放初阶：-15%打断概率</li>
                                <li>高阶放初阶：-30%，放中阶：-15%</li>
                                <li>超阶放初阶：-45%，放中阶：-30%，放高阶：-15%</li>
                            </ul>
                            <p style="margin: 8px 0 4px 0;"><b style="color:#66ffaa;">防御姿态抗打断</b>：上回合防御，本回合打断概率-20%</p>
                            <p style="margin: 8px 0 4px 0;"><b style="color:#ff66ff;">打断敌方施法</b>：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li>仅<b style="color:#66ccff;">魔法师敌人</b>（🔮法师标记）有引导施法，妖魔不引导</li>
                                <li>普通攻击命中有概率打断（10-60%，精神力对抗）</li>
                                <li><b style="color:#66ccff;">控制技能</b>（眩晕/沉默/冰冻/麻痹/束缚等）100%打断</li>
                                <li>敌方引导时头顶显示进度，脉冲动画提示</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">👹 妖魔天赋</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <p style="margin: 0 0 8px 0;">每个妖魔都有独特的种族天赋：</p>
                            <ul style="margin: 0; padding-left: 20px;">
                                <li><b style="color: #ff8866;">高速型</b>：速度快，闪避高，先手攻击</li>
                                <li><b style="color: #8888ff;">防御型</b>：防御高，血量厚，难以击败</li>
                                <li><b style="color: #ff4444;">攻击型</b>：攻击力强，伤害高</li>
                                <li><b style="color: #aa44ff;">控制型</b>：会施加各种负面状态</li>
                                <li>注意观察敌人的特点，制定策略</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">📊 状态效果</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                                <span>🔥 灼烧：持续掉血</span>
                                <span>❄️ 冻结：无法行动</span>
                                <span>⚡ 麻痹：无法行动</span>
                                <span>🐌 减速：速度降低</span>
                                <span>💀 诅咒：攻击降低</span>
                                <span>🛡️ 护盾：吸收伤害</span>
                                <span>💚 再生：持续回血</span>
                                <span>💨 加速：速度提升</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">💡 战斗技巧</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.8;">
                            <li>利用元素克制可以大幅提高伤害</li>
                            <li>尝试触发元素反应获得额外效果</li>
                            <li>防御可以在危险时减少伤害，还能回蓝</li>
                            <li>打断敌人引导可以避免高额伤害</li>
                            <li>MP不足时用普攻或防御回蓝</li>
                            <li>妖魔有独特的种族天赋，注意观察</li>
                            <li>右上角可以调整战斗速度</li>
                            <li>战斗评价越高，奖励越丰厚</li>
                        </ul>
                    </div>
                    
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #66ccff; margin-bottom: 8px; font-size: 16px;">⌨️ 快捷键</h3>
                        <div style="color: #ccc; font-size: 14px; line-height: 1.8;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                                <span><b>1-9</b>：使用技能</span>
                                <span><b>空格</b>：普通攻击</span>
                                <span><b>D</b>：防御</span>
                                <span><b>F</b>：逃跑</span>
                                <span><b>A</b>：自动战斗</span>
                                <span><b>S</b>：切换速度</span>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="BattleSystem.closeHelp()" style="
                            padding: 10px 30px;
                            background: linear-gradient(135deg, #4444aa, #6666cc);
                            border: 2px solid #8888ee;
                            border-radius: 8px;
                            color: #fff;
                            cursor: pointer;
                            font-size: 16px;
                            font-weight: bold;
                        ">
                            我知道了
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const helpDiv = document.createElement('div');
        helpDiv.id = 'battle-help-overlay';
        helpDiv.innerHTML = helpHtml;
        document.body.appendChild(helpDiv);
    }


// 导出模块集合
export const BattleHelp = {
    showHelp
};

export default BattleHelp;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.BattleHelp = BattleHelp;
}