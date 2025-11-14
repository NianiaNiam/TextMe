// 全屏功能模块
(function() {
    'use strict';
    
    // 全屏API兼容性处理
    const fullscreenApi = {
        requestFullscreen: function(element) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            }
        },
        
        exitFullscreen: function() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
        },
        
        isFullscreen: function() {
            return !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement ||
                document.mozFullScreenElement
            );
        }
    };
    
    // 自动进入全屏模式
    function autoEnterFullscreen() {
        // 延迟执行，确保页面完全加载
        setTimeout(function() {
            if (!fullscreenApi.isFullscreen()) {
                fullscreenApi.requestFullscreen(document.documentElement);
            }
        }, 1000);
    }
    
    // 隐藏状态栏和导航栏
    function hideSystemUI() {
        // 对于移动设备，尝试隐藏地址栏
        if (window.scrollTo) {
            window.scrollTo(0, 1);
        }
        
        // 添加全屏样式
        document.documentElement.style.setProperty('--safe-area-inset-top', '0px');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', '0px');
        document.documentElement.style.setProperty('--safe-area-inset-left', '0px');
        document.documentElement.style.setProperty('--safe-area-inset-right', '0px');
    }
    
    // 监听页面加载事件
    function initFullscreen() {
        // 检查是否是PWA模式
        const isPWA = window.matchMedia('(display-mode: fullscreen)').matches ||
                     window.matchMedia('(display-mode: standalone)').matches ||
                     (window.navigator.standalone === true);
        
        if (isPWA) {
            console.log('PWA模式检测到，启用全屏优化');
            autoEnterFullscreen();
            hideSystemUI();
        }
        
        // 监听用户交互，尝试进入全屏
        const userInteractionEvents = ['touchstart', 'click', 'keydown'];
        
        function attemptFullscreen() {
            if (!fullscreenApi.isFullscreen()) {
                fullscreenApi.requestFullscreen(document.documentElement);
            }
            
            // 移除事件监听器，避免重复触发
            userInteractionEvents.forEach(event => {
                document.removeEventListener(event, attemptFullscreen);
            });
        }
        
        userInteractionEvents.forEach(event => {
            document.addEventListener(event, attemptFullscreen, { once: true });
        });
    }
    
    // 监听全屏状态变化
    function onFullscreenChange() {
        if (fullscreenApi.isFullscreen()) {
            console.log('已进入全屏模式');
            hideSystemUI();
            
            // 触发resize事件，让页面重新布局
            window.dispatchEvent(new Event('resize'));
        } else {
            console.log('已退出全屏模式');
        }
    }
    
    // 监听屏幕方向变化
    function onOrientationChange() {
        setTimeout(function() {
            if (fullscreenApi.isFullscreen()) {
                hideSystemUI();
                window.dispatchEvent(new Event('resize'));
            }
        }, 300);
    }
    
    // 添加事件监听器
    document.addEventListener('DOMContentLoaded', initFullscreen);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('msfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    
    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('resize', function() {
        if (fullscreenApi.isFullscreen()) {
            hideSystemUI();
        }
    });
    
    // 提供全局访问接口
    window.FullscreenManager = {
        enterFullscreen: function() {
            fullscreenApi.requestFullscreen(document.documentElement);
        },
        exitFullscreen: function() {
            fullscreenApi.exitFullscreen();
        },
        isFullscreen: function() {
            return fullscreenApi.isFullscreen();
        }
    };
    
    console.log('全屏管理器已加载');
})();