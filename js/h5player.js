/*
h5播放器入口
 */
function H5player(params) {
    this.h5playerVersion = '0.0.1'; //h5player版本
    this.roomId = params.roomId || '';
    this.videoId = params.videoId || '';
    this.userUid = params.userUid || '';
    this.host = params.host || 'https://chushou.tv';
    this.COOKIE_NAME = 'h5player'; //cookie名
    this.COOKIE_EXPIRE_DAYS = 7; //cookie过期天数
    this.DEFAULT_VOLUME = 50; // 默认音量
    this.DEFAULT_BARRAGE_SWITCH = 1; //弹幕开关 0关 1开
    this.DEFAULT_BARRAGE_FULLSCREEN_INPUT_SWITCH = 1; //弹幕全屏输入开关 0关 1开
    this.DEFAULT_BARRAGE_OPACITY = 0; //弹幕透明度 0无 1低 2中 3高
    this.DEFAULT_BARRAGE_POSITION = 0; //弹幕位置 0全屏 1顶端 2底端
    this.SINGLE_TUNNEL_HEIGHT = 36; //弹幕轨道高度，弹幕高度30px
    this.BARRAGE_FLY_SPEED = 120; // 弹幕运行速度px/s
    this.SYSTEM_MESSAGE_FLY_SPEED = 100; // 喇叭速度px/s
    this.GIFTCOMBO_ANIMATION_FLY_SPEED = 120; // 连击动画飘屏速度px/s
    this.BARRAGE_CHECK_TIME = 300; //弹幕计时器间隔时长 ms
    this.logDebugSwitch = false; //日志调试开关
    this.BARRAGE_SPEED_MODE = 0; //弹幕速度 0变速 1匀速
    this.BARRAGE_MAX_SPEED = 200; //弹幕最大速度
    this.LONG_BARRAGE_NEED_TIME = 3; //弹幕长度超过屏幕宽度时的默认时长 秒
    this.mediaInfo = {
        width: 1280,
        height: 720
    };
    window.h5playerLogLevel = 0;
    this.playerInit();
}
H5player.prototype = {
    playerInit: function() {
        if (flvjs.isSupported()) {
            var self = this;
            this.logInit();
            $('.h5player-rightmenu-item').eq(0).text('HTML5 Live Player v' + this.h5playerVersion);
            this.h5liveplayerInit(function() {
                h5playerLog('live player init finish', 2);
                self.barrageInit(function() {
                    h5playerLog('barrage init finish', 2);
                    self.controlBarInit(function() {
                        window.console && console.log('h5player init all...');
                    });
                })
            });
            self.bind();
        } else {
            alert('浏览器不支持播放');
        }
    },
    //播放初始化
    h5liveplayerInit: function(callback) {
        var params = {
            roomId: this.roomId,
            host: this.host,
            videoId: this.videoId,
            cookieName: this.COOKIE_NAME,
            cookieExpireDays: this.COOKIE_EXPIRE_DAYS,
            defaultVolume: this.DEFAULT_VOLUME,
            main: this
        };
        var self = this;
        new H5playerLive(params, function(player, mediaInfo) {
            self.player = player;
            if (mediaInfo && mediaInfo.width) {
                self.mediaInfo = mediaInfo;
            }
            self.setPlayerSize(self.mediaInfo.width, self.mediaInfo.height);
            callback();
        });
    },
    //控制栏初始化
    controlBarInit: function(callback) {
        var params = {
            player: this.player,
            videoId: this.videoId,
            barrage: this.barrage,
            main: this
        };
        var self = this;
        new H5playerControlBar(params, function(controlBar) {
            self.controlBar = controlBar;
            callback();
        });
    },
    //弹幕功能初始化
    barrageInit: function(callback) {
        var self = this;
        var params = {
            player: this.player,
            videoId: this.videoId,
            barrageSwitch: this.DEFAULT_BARRAGE_SWITCH,
            barrageFullscreenInputSwitch: this.DEFAULT_BARRAGE_FULLSCREEN_INPUT_SWITCH,
            barrageOpacity: this.DEFAULT_BARRAGE_OPACITY,
            barragePosition: this.DEFAULT_BARRAGE_POSITION,
            cookieName: this.COOKIE_NAME,
            cookieExpireDays: this.COOKIE_EXPIRE_DAYS,
            singleTunnelHeight: this.SINGLE_TUNNEL_HEIGHT,
            barrageFlySpeed: this.BARRAGE_FLY_SPEED,
            barrageCheckTime: this.BARRAGE_CHECK_TIME,
            barrageSpeedMode: this.BARRAGE_SPEED_MODE,
            barrageMaxSpeed: this.BARRAGE_MAX_SPEED,
            longBarrageNeedTime: this.LONG_BARRAGE_NEED_TIME,
            systemMessageSpeed: this.SYSTEM_MESSAGE_FLY_SPEED,
            giftcomboAnimationSpeed: this.GIFTCOMBO_ANIMATION_FLY_SPEED,
            userUid: this.userUid
        };
        new H5playerBarrage(params, function(barrage) {
            self.barrage = barrage;
            callback();
        });
    },
    setPlayerSize: function(videoWidth, videoHeight) {
        var playerWidth = $('#live-h5player-container').width();
        var playerHeight = videoHeight * playerWidth / videoWidth;
        $('#live-h5player-container').css('height', playerHeight);
    },
    //flash->html5
    switchBack: function() {
        if (this.player) {
            this.player.getLiveStreamUrl();
            this.barrage.queue.setBarrageStatus(1).setAnimationStatus(1);
        }
    },
    //html5->flash
    destroy: function() {
        if (this.player) {
            this.player.playerDestroy();
            $('.live-h5player-barrage').html('');
            $('#system-message,#giftcombo-animation').hide();
            this.barrage.queue.setBarrageStatus(0).clearAnimationBuffer();
        }
    },
    logInit: function() {
        this.logDebugLevel = this.getUrlParam('h5playerdebug'); //0关闭 1debug 2info 3warn 4error
        this.logDebugSwitch = !isNaN(this.logDebugLevel) && this.logDebugLevel > 0 ? true : false;
        if (this.logDebugSwitch) {
            window.h5playerLog = this.log;
            window.h5playerLogLevel = parseInt(this.logDebugLevel);
        } else {
            window.h5playerLog = function() {
                return;
            }
        }
    },
    log: function(msg, level) {
        if (window.console) {
            var logLevel = {
                1: '[debug]',
                2: '[info]',
                3: '[warn]',
                4: '[error]'
            }
            if (level >= h5playerLogLevel) {
                console.log('h5playerlog:' + logLevel[level] + ' > ' + msg);
            }
        }
    },
    getUrlParam: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]);
        return null;
    },
    onGetMideaInfo: function(mediaInfo) {
        this.mediaInfo = mediaInfo;
        this.setPlayerSize(mediaInfo.width, mediaInfo.height);
    },
    bind: function() {
        var self = this;
        $(window).resize(function() {
            self.setPlayerSize(self.mediaInfo.width, self.mediaInfo.height);
            if (self.barrage && self.barrage.tunnelManager) {
                //重新计算弹幕轨道区域大小
                self.barrage.tunnelManager.calculateTunnelCount(self.barrage.barrageConfig.barragePosition, function(activeTunnels, nowActiveCount, lastActiveCount) {
                    //缩小则隐藏多余弹幕
                    if (lastActiveCount > nowActiveCount || self.barrage.barrageConfig.barragePosition == 2) {
                        var startIndex = activeTunnels[activeTunnels.length - 1].index + 1;
                        self.barrage.bulletManager.hide(startIndex, -1, function() {})
                    }
                })
            }
        })
    },
    //for heartbeat
    isLiving: function() {
        if (this.player) {
            return this.player.isLiving;
        } else {
            return false;
        }
    },
    updateLiveTime: function(liveTime) {
        var str = '';
        var sec = Math.floor(liveTime / 1000);
        if (liveTime < 1000) {
            str = '刚刚开播';
        } else if (liveTime > 1000 && liveTime < 60 * 60 * 1000) {
            var min = Math.floor(sec / 60);
            str = ' 已开播：' + min + '分钟';
        } else {
            var hour = Math.floor(sec / 3600);
            var min = Math.floor((sec - hour * 3600) / 60);
            var str = '已开播时间：' + hour + '小时' + min + '分钟';
            $('.live-time-now').text('已开播时间：' + hour + '小时' + min + '分钟');
        }
        $('.live-time-now').text(str);
    },
    offLive:function(name,roomId){
        console.log(name,roomId);
        var self = this;
        if(this.player){
            this.destroy();
            $('.live-over-detail').text(escapeString(name)+'的直播已结束，喜欢就点击关注吧！');
            this.player.offLive(roomId,function(data){
                 $('.live-over-recommend').html(data);
                 $('.h5player-unsupport-autoplay,.live-interrupt').hide();
                 $('.live-over').show();
            });
        }
    }
};
H5player.isThisBrowser = function(name) {
    var ua = navigator.userAgent.toLowerCase();
    var reg = {
        'ie': /msie\s([\d.]+)/,
        'chrome': /chrome\/([\d.]+)/,
        'firefox': /firefox\/([\d.]+)/,
        'opera': /opera\/.*version\/([\d.]+)/,
        'safari': /version\/([\d.]+).*safari/
    };
    var currentReg = reg[name] ? reg[name] : new RegExp(name, "g");
    if (currentReg.test(ua)) {
        return true;
    }
    return false;
}
H5player.isSupported = function(name) {
    return window.MediaSource && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
}