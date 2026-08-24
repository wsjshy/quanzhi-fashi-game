/**
 * UI系统 - 角色创建界面模块
 * 
 * 从ui.js拆分出的独立角色创建界面模块
 * 包含：渲染角色创建界面（renderCharacterCreate）
 */

export function renderCharacterCreate() {
        // v1.4.5: 觉醒流程重构 - 先选天生天赋，天赋决定系别
        // 角色创建界面只输入角色名，然后直接进入天生天赋选择

        // v0.92.15: 强制恢复点击
        const forceRestoreClicks = () => {
            document.body.classList.remove('message-showing');
            const gc = document.getElementById('game-container');
            if (gc) gc.style.pointerEvents = '';
            if (typeof UI !== 'undefined') {
                ['_globalClickInterceptor', '_prevClickInterceptor'].forEach(key => {
                    if (UI[key]) {
                        document.removeEventListener('click', UI[key], true);
                        document.removeEventListener('mousedown', UI[key], true);
                        document.removeEventListener('mouseup', UI[key], true);
                        UI[key] = null;
                    }
                });
            }
        };
        forceRestoreClicks();
        setTimeout(forceRestoreClicks, 100);
        setTimeout(forceRestoreClicks, 500);

        this.elements.gameContainer.innerHTML = `
            <div style="
                width: 100%;
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: linear-gradient(135deg, #0a0a2a 0%, #1a1a4a 50%, #0a0a3a 100%);
                padding: 40px;
                position: relative;
                pointer-events: auto;
                z-index: 9999;
            ">
                <div style="
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background: url('assets/images/effects/thunder_magic.jpg') center/cover;
                    opacity: 0.12;
                    filter: blur(3px);
                    z-index: 0;
                    pointer-events: none;
                "></div>
                
                <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center;">
                <h2 style="
                    font-size: 36px;
                    color: #ffd700;
                    margin-bottom: 10px;
                    letter-spacing: 4px;
                ">创建角色</h2>
                
                <p style="color: #8888aa; margin-bottom: 40px; font-size: 16px;">觉醒仪式即将开始，先告诉我你的名字...</p>
                
                <div style="margin-bottom: 40px;">
                    <label style="color: #aaa; font-size: 16px; margin-right: 15px;">角色名：</label>
                    <input type="text" id="char-name" maxlength="10" value="冒险者"
                           style="
                               padding: 10px 15px;
                               font-size: 18px;
                               background: rgba(20, 20, 50, 0.8);
                               border: 2px solid #444477;
                               border-radius: 8px;
                               color: #fff;
                               width: 200px;
                           ">
                </div>

                <div onclick="try { Game.createCharacter(document.getElementById('char-name').value||'冒险者'); } catch(e) { alert('错误:'+e.message); }" style="
                    padding: 15px 50px;
                    font-size: 20px;
                    background: linear-gradient(135deg, #2a2a6a, #4a4aaa);
                    border: 2px solid #6666cc;
                    color: #e0e0ff;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    letter-spacing: 4px;
                    display: inline-block;
                    position: relative;
                    z-index: 100;
                " id="confirm-btn">
                    开始觉醒
                </div>

                <p style="color: #666; margin-top: 30px; font-size: 13px; text-align: center; line-height: 1.8;">
                    觉醒时将先感知你的<span style="color:#ffd700;">天生天赋</span><br>
                    天赋决定你的魔法之路，稀有天赋可觉醒稀有系别
                </p>
                </div>
            </div>
        `;

        // v0.92.15: 强制设置game-container可点击
        const _gc = document.getElementById('game-container');
        if (_gc) {
            _gc.style.pointerEvents = 'auto';
            _gc.style.zIndex = '9999';
        }
    }


// 导出模块集合
export const UICharacterCreate = {
    renderCharacterCreate
};

export default UICharacterCreate;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UICharacterCreate = UICharacterCreate;
}