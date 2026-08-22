/**
 * UI渲染 - 消息提示模块
 * 
 * 从ui.js拆分出的独立消息提示模块
 * 包含：显示单条消息（_showSingleMessage）
 */

export function _showSingleMessage(text) {
        const ui = this;
        
        console.log('[消息] 显示消息:', text.substring(0, 50));
        
        // 立即开启行动冷却，防止点击穿透
        if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
            Game._actionCooldown = true;
        }
        
        // 禁用所有行动按钮，防止点击穿透
        document.body.classList.add('message-showing');
        
        // 禁用主容器点击，防止点击穿透
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.style.pointerEvents = 'none';
        }
        
        // 全局点击拦截：在捕获阶段阻止所有弹窗外部的点击事件，防止点击穿透
        // 重要：使用局部变量保存拦截器引用，避免多条消息时互相覆盖导致无法移除
        const clickInterceptor = (e) => {
            // 检查点击目标是否在弹窗内部
            let target = e.target;
            let inPopup = false;
            while (target) {
                if (target.classList && (target.classList.contains('mobile-popup') || target.classList.contains('mobile-popup-overlay'))) {
                    inPopup = true;
                    break;
                }
                target = target.parentElement;
            }
            // 如果不在弹窗内部，阻止事件
            if (!inPopup) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('[消息] 拦截到弹窗外部点击，已阻止');
            }
        };
        this._globalClickInterceptor = clickInterceptor; // 保留全局引用用于兼容
        // v0.92.11: 先移除之前的点击拦截器，防止多个拦截器叠加
        if (this._prevClickInterceptor) {
            document.removeEventListener('click', this._prevClickInterceptor, true);
            document.removeEventListener('mousedown', this._prevClickInterceptor, true);
            document.removeEventListener('mouseup', this._prevClickInterceptor, true);
        }
        this._prevClickInterceptor = clickInterceptor;
        document.addEventListener('click', clickInterceptor, true);
        document.addEventListener('mousedown', clickInterceptor, true);
        document.addEventListener('mouseup', clickInterceptor, true);
        
        // 创建遮罩层（阻止所有点击穿透）
        const overlay = document.createElement('div');
        overlay.className = 'mobile-popup-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999998;
            cursor: pointer;
            pointer-events: auto;
        `;

        // 创建消息框
        const msgBox = document.createElement('div');
        msgBox.className = 'mobile-popup';
        msgBox.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(10, 10, 30, 0.98);
            border: 2px solid #6666aa;
            border-radius: 10px;
            padding: 30px 40px 25px;
            color: #e0e0ff;
            font-size: 16px;
            line-height: 1.8;
            text-align: center;
            z-index: 9999999;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 0 30px rgba(100, 100, 255, 0.5);
            white-space: pre-line;
            pointer-events: auto;
        `;
        
        // 消息内容
        const contentDiv = document.createElement('div');
        contentDiv.textContent = text;
        contentDiv.style.marginBottom = '20px';
        msgBox.appendChild(contentDiv);
        
        // 关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '确定';
        closeBtn.style.cssText = `
            padding: 10px 40px;
            background: linear-gradient(135deg, #4444aa, #6666cc);
            border: 2px solid #7777dd;
            border-radius: 8px;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            pointer-events: auto;
        `;
        closeBtn.onmouseover = () => {
            closeBtn.style.background = 'linear-gradient(135deg, #5555bb, #7777dd)';
            closeBtn.style.transform = 'scale(1.05)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.background = 'linear-gradient(135deg, #4444aa, #6666cc)';
            closeBtn.style.transform = 'scale(1)';
        };
        msgBox.appendChild(closeBtn);

        // 关闭消息函数
        let closed = false;
        const closeMessage = () => {
            if (closed) return;
            closed = true;
            
            console.log('[消息] 关闭消息');
            
            // 记录消息关闭时间，用于防止点击穿透
            ui._lastMessageCloseTime = Date.now();
            
            // 立即移除 message-showing 类，恢复界面点击
            document.body.classList.remove('message-showing');
            
            // 立即恢复主容器点击
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.pointerEvents = '';
            }
            
            // 延迟移除全局点击拦截器，防止弹窗关闭后的延迟点击事件（v0.92.16: 500ms→50ms）
            setTimeout(() => {
                document.removeEventListener('click', clickInterceptor, true);
                document.removeEventListener('mousedown', clickInterceptor, true);
                document.removeEventListener('mouseup', clickInterceptor, true);
                // 如果全局引用还是这个拦截器，就清空
                if (ui._globalClickInterceptor === clickInterceptor) {
                    ui._globalClickInterceptor = null;
                }
            }, 50);
            
            // 设置行动冷却，防止点击穿透/延迟触发（v0.92.16: 500ms→50ms）
            if (typeof Game !== 'undefined' && Game._actionCooldown !== undefined) {
                Game._actionCooldown = true;
                setTimeout(() => {
                    Game._actionCooldown = false;
                }, 50);
            }
            
            // 先创建阻止点击穿透的遮罩层（在最顶层）
            const blocker = document.createElement('div');
            blocker.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999999;pointer-events:auto;background:transparent;';
            // 阻止所有点击事件
            const stopEvent = (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            };
            blocker.addEventListener('mousedown', stopEvent);
            blocker.addEventListener('mouseup', stopEvent);
            blocker.addEventListener('click', stopEvent);
            blocker.addEventListener('touchstart', stopEvent);
            blocker.addEventListener('touchend', stopEvent);
            document.body.appendChild(blocker);
            
            overlay.remove();
            msgBox.remove();
            
            // v1.2.0: 200ms→300ms，更彻底防止点击穿透（部分设备点击事件延迟较长）
            setTimeout(() => blocker.remove(), 300);
            
            // 处理下一条消息
            ui._processNextMessage();
        };
        
        // 点击遮罩层关闭
        overlay.addEventListener('click', (e) => {
            console.log('[消息] 点击遮罩层关闭');
            e.preventDefault();
            e.stopPropagation();
            closeMessage();
        });
        
        // 点击消息框内容也关闭（除了按钮）
        contentDiv.addEventListener('click', (e) => {
            console.log('[消息] 点击内容关闭');
            e.preventDefault();
            e.stopPropagation();
            closeMessage();
        });
        
        // 点击关闭按钮
        closeBtn.addEventListener('click', (e) => {
            console.log('[消息] 点击确定按钮关闭');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            closeMessage();
        });
        
        // 阻止消息框的点击事件冒泡到遮罩层
        msgBox.addEventListener('click', (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        document.body.appendChild(overlay);
        document.body.appendChild(msgBox);
        
        console.log('[消息] 弹窗已添加到页面');

        // 5秒后自动消失
        setTimeout(() => {
            if (!closed) {
                console.log('[消息] 自动关闭');
                closeMessage();
            }
        }, 5000);
    }


// 导出模块集合
export const UIMessage = {
    _showSingleMessage
};

export default UIMessage;

// 向后兼容：挂载到window
if (typeof window !== 'undefined') {
    window.UIMessage = UIMessage;
}