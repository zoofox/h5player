/*
h5播放器控制栏
 */
function H5playerControlBar(params, callback) {
    this.player = params.player;
    this.barrage = params.barrage;
    this.videoId = params.videoId;
    this.main = params.main;
    this.videoRotateDeg = 0; //屏幕旋转角度
    this.isFullScreen = false; //是否全屏
    this.callback = callback;
    this.init();
}
H5playerControlBar.prototype = {
    init: function() {
        this.controBarStatusInit();
        this.operate();
        this.callback(this);
    },
    controBarStatusInit: function() {
        //标记videoWidth videoHeight用于处理退出全屏后video宽高
        this.videoWidth = $('.live-h5player-container').width();
        this.videoHeight = $('.live-h5player-container').height();
        this.videoFullScreenWidth = 0; //全屏video宽度
        //播放
        $('.h5player-pauseplay').removeClass('h5player-pauseplay-switch').attr('data-status', 1)
            .find('.controlbar-tip').text('暂停');
        //音量
        var isMute = this.player.getIsMute();
        var volume = this.player.getVolume();
        this.setVolume(volume, isMute);

        //线路
        var streamData = this.player.getStreamData();
        var streamIndex = this.player.getStreamIndex();
        var steamLen = streamData.length;
        var streamHtml = '';
        if (steamLen > 0) {
            var def = streamData[streamIndex].def;
            $('')
            for (var i = 0; i < steamLen; i++) {
                streamHtml += '<p class="definition-item" data-def="' + streamData[i].def + '">' + streamData[i].str + '</p>'
            }
            $('.definition-items').html(streamHtml);
            this.setStreamDefinition(streamIndex, def);
        } else {
            $('.definition-items').html('');
        }

        //右键菜单
        $('.live-h5player-container').contextmenu(function(e) {
            var clientX = e.clientX;
            var clientY = e.clientY;
            var containerX = $('.live-h5player-container').offset().left;
            var containerY = $('.live-h5player-container').offset().top;
            var menuX = clientX - containerX;
            var menuY = clientY - containerY;
            $('.live-h5player-rightmenu').css({
                top: menuY,
                left: menuX
            }).show();
            return false;
        });

        //弹幕
        var barrageConfig = this.barrage.getAllBarrageParams();
        this.importBarrageConfig(barrageConfig);
    },
    operate: function() {
        var self = this;
        //暂停 播放
        $('.h5player-pauseplay').click(function() {
            var status = parseInt($(this).attr('data-status'));
            if (status == 1) {
                var text = '播放';
                self.player.pause();
            } else {
                var text = '暂停';
                self.player.getCurrentTime(function(currentTime) {
                    self.player.seekTo(currentTime);
                    self.player.play();
                })
            }
            status = 1 - status;
            $(this).toggleClass('h5player-pauseplay-switch').attr('data-status', status)
                .find('.controlbar-tip').text(text);
        })
        //重新载入
        $('.h5player-reload').click(function() {
            if ($('.h5player-pauseplay').attr('data-status') == '0') {
                $('.h5player-pauseplay').removeClass('h5player-pauseplay-switch').attr('data-status', 1)
                    .find('.controlbar-tip').text('暂停');
            }
            self.player.refresh();
        })
        //窗口全屏
        $('.h5player-fullscreen').click(function() {
            //退出全屏
            if (self.isFullScreen) {
                $('.h5player-fullscreen').removeClass('h5player-fullscreen-ing');
                self.exitFullScreen();
                //全屏
            } else {
                $('.h5player-fullscreen').addClass('h5player-fullscreen-ing');
                self.requestFullScreen($('#live-h5player-container').get(0));
            }
        })
        //剧场模式
        $('.h5player-pagescreen').click(function() {
            //退出
            if (self.isPageScreen) {
                self.isPageScreen = false;
                $('.h5player-pagescreen').removeClass('h5player-pagescreen-ing')
                    .find('.controlbar-tip').text('剧场模式');
            } else {
                self.isPageScreen = true;
                $('.h5player-pagescreen').addClass('h5player-pagescreen-ing')
                     .find('.controlbar-tip').text('退出剧场模式');
                
            }
        })
        //屏幕旋转
        $('.h5player-rotate').click(function() {
            //第一次进入全屏的旋转操作
            if (self.isFullScreen && self.videoFullScreenWidth == 0) {
                self.videoFullScreenWidth = $('.live-h5player-container').width();
                self.videoFullScreenHeight = $('.live-h5player-container').height();
            }
            //第一次退出全屏的旋转操作
            if (!self.isFullScreen && self.videoWidth == 0) {
                self.videoWidth = $('.live-h5player-container').width();
                self.videoHeight = $('.live-h5player-container').height();
            }
            self.videoRotateDeg += 90;
            self.videoRotateDeg = self.videoRotateDeg % 360;
            if (self.isFullScreen) {
                var nextWidth = (self.videoRotateDeg / 90) % 2 == 1 ? self.videoFullScreenHeight : self.videoFullScreenWidth;
            } else {
                var nextWidth = (self.videoRotateDeg / 90) % 2 == 1 ? self.videoHeight : self.videoWidth;
            }
            $('.live-h5player-video-box').css({
                'transform': 'rotate(' + self.videoRotateDeg + 'deg)',
                'width': nextWidth
            });
        })
        //全屏状态下esc按键无法监视，故采用fullscreenchange统一监视全屏和退出全屏操作并处理video宽高
        $(document).bind('fullscreenchange webkitfullscreenchange mozfullscreenchange', function() {
            if (self.checkFull()) {
                self.fullScreenVideoChange();
            } else {
                self.exitFullScreenVideoChange();
            }
        })
        //静音开关
        $('.h5player-volume').click(function(e) {
            if (e.target.classList.value.indexOf('h5player-volume') > -1) {
                if ($(this).hasClass('h5player-volume-mute')) {
                    $(this).removeClass('h5player-volume-mute');
                    var lastVolume = self.player.getVolume();
                    self.setVolume(lastVolume, false);
                } else {
                    $(this).addClass('h5player-volume-mute');
                    self.setVolume(0, true);
                }
            }
        })
        //点击调音量
        $('.volume-line').click(function(e) {
            var lineClientY = $('.volume-line').offset().top;
            var pointClientY = e.clientY;
            var offsetY = pointClientY - lineClientY;
            var volume = Math.floor((75 - offsetY) * 100 / 75);
            self.setVolume(volume, false);
        })
        //拖动调节音量
        $('.volume-ball').on('mousedown', null, mousedownHandler);

        function mousedownHandler(event) {
            $(document).on('mousemove', null, mousemoveHandler);
            $(document).on('mouseup', null, mouseupHandler);
            event.preventDefault();
            event.stopPropagation();
        }

        function mousemoveHandler(e) {
            var lineClientY = $('.volume-line').offset().top;
            var pointClientY = e.clientY;
            var offsetY = pointClientY - lineClientY;
            if (offsetY > 75) {
                var volume = 0;
            } else if (offsetY < 0) {
                var volume = 100;
            } else {
                var volume = Math.floor((75 - offsetY) * 100 / 75);
            }
            self.setVolume(volume, false);
            event.preventDefault();
            event.stopPropagation();
        }

        function mouseupHandler(event) {
            $(document).off('mousemove', null, mousemoveHandler);
            $(document).off('mouseup', null, mouseupHandler);
            event.preventDefault();
            event.stopPropagation();
        }
        //键盘调节音量    
        $(document).keydown(function(event) {
            var e = event || window.event;
            var k = e.keyCode || e.which;
            if (!$('.volume-line').is(':hidden')) {
                switch (k) {
                    //up
                    case 38:
                        var currentVolume = self.getVolume();
                        if (currentVolume >= 95) {
                            self.setVolume(100, false);
                        } else {
                            self.setVolume(currentVolume + 5, false);
                        }
                        break;
                        //down
                    case 40:
                        var currentVolume = self.getVolume();
                        if (currentVolume <= 5) {
                            self.setVolume(0, true);
                        } else {
                            self.setVolume(currentVolume - 5, false);
                        }
                        break;
                }
            }

        })
        //切换线路
        $('body').on('click', '.definition-item', function() {
            if (!$(this).hasClass('active')) {
                var index = $(this).index();
                var def = $(this).data('def');
                self.player.setStreamDefinition(index, function() {
                    self.setStreamDefinition(index, def);
                });
            }
        })
        //弹幕开关
        $('.h5player-barrage').click(function(e) {
            if (e.target.classList.value.indexOf('h5player-barrage') > -1) {
                var status = $(this).attr('data-status');
                self.barrageSwitch = status;
                if (status == 0) {
                    $(this).find('.controlbar-tip').text('关闭弹幕');
                    self.barrage.open();
                } else {
                    $(this).find('.controlbar-tip').text('开启弹幕');
                    self.barrage.close();
                }
                status = 1 - status;
                $(this).attr('data-status', status);
                self.setBarrageParam('barrageSwitch', status);
                $(this).toggleClass('h5player-barrage-off');
            }

        })
        //全屏弹幕输入开关
        $('.barrage-fullscreen-input-switch').click(function() {
            var value = $(this).data('value');
            $(this).addClass('active').siblings('.barrage-fullscreen-input-switch').removeClass('active');
            self.setBarrageParam('barrageFullscreenInputSwitch', value);
        })
        //弹幕透明度
        $('.barrage-opacity-choice').click(function() {
            var value = $(this).data('value');
            $(this).addClass('active').siblings('.barrage-opacity-choice').removeClass('active');
            self.setBarrageParam('barrageOpacity', value);
        })
        //弹幕位置
        $('.barrage-position-choice').click(function() {
            if (!$(this).hasClass('active')) {
                var value = $(this).data('value');
                $(this).addClass('active').siblings('.barrage-position-choice').removeClass('active');
                self.barrage.changePosition(value, function() {
                    self.setBarrageParam('barragePosition', value);
                });
            }
        })
        //控制栏显示
        $('.live-h5player-container').hover(function() {
            if ($('.live-h5player-controlbar').hasClass('controlbar-bottom')) {
                $('.live-h5player-controlbar').removeClass('controlbar-bottom');
            }
            if ($('#live-h5player-container .live-time').hasClass('live-time-hidden')) {
                $('#live-h5player-container .live-time').removeClass('live-time-hidden');
            }
        }, function() {
            if (!$('.live-h5player-controlbar').hasClass('controlbar-bottom')) {
                $('.live-h5player-controlbar').addClass('controlbar-bottom');
            }
            if (!$('#live-h5player-container .live-time').hasClass('live-time-hidden')) {
                $('#live-h5player-container .live-time').addClass('live-time-hidden');
            }
        })
        $('.live-h5player-container').click(function() {
            $('.live-h5player-rightmenu').hide();
        })
        //切换到Flash播放器
        $('.h5plyaer-switch-flash').click(function() {
            self.main.destroy();
            $('.live-h5player-rightmenu').hide();
        })
        $('.unsupport-autoplay-btn').click(function() {
            $('.h5player-unsupport-autoplay').hide();
            self.player.getCurrentTime(function(currentTime) {
                self.player.seekTo(currentTime);
                self.player.play();
            })

        })
    },
    //弹幕参数
    setBarrageParam: function(name, value) {
        if (this.barrage) {
            this.barrage.setBarrageParam(name, value);
        }
    },
    //弹幕配置导入
    importBarrageConfig: function(config) {
        if (config.barrageSwitch == 0) {
            $('.h5player-barrage').addClass('h5player-barrage-off');
            $('.h5player-barrage').attr('data-status', config.barrageSwitch);
        }
        if (config.barrageFullscreenInputSwitch == 0) {
            $('.barrage-fullscreen-input-off').addClass('active');
            $('.barrage-fullscreen-input-on').removeClass('active');
        }
        var barrageOpacity = config.barrageOpacity;
        $('.barrage-opacity-choice' + barrageOpacity).addClass('active')
            .siblings('.barrage-opacity-choice').removeClass('active');
        var barragePosition = config.barragePosition;
        $('.barrage-position-choice' + barragePosition).addClass('active')
            .siblings('.barrage-position-choice').removeClass('active');

    },
    //音量设置
    setVolume: function(volume, isMute) {
        if (isMute || volume == 0) {
            this.player.setMute();
            $('.h5player-volume').addClass('h5player-volume-mute');
            $('.volume-ball').css({
                bottom: '20px'
            })
            $('.volume-percent').text('静音').css({
                bottom: '15px'
            })
            $('.volume-line-gray').css('marginTop', '0');
            this.volume = 0;
        } else {
            this.player.setVolume(volume);
            $('.h5player-volume').removeClass('h5player-volume-mute');
            var volumeHeight = volume * 75 / 100;
            var ballBottom = 20 + volumeHeight;
            $('.volume-ball').css({
                bottom: ballBottom + 'px'
            })
            var percentBottom = ballBottom - 5;
            $('.volume-percent').text(volume + '%').css({
                bottom: percentBottom + 'px'
            })
            $('.volume-line-gray').css('marginTop', '-' + volumeHeight + 'px');
            this.volume = volume;
        }
    },
    getVolume: function() {
        /*
        this.volume记录当前音量状态，静音时为0
        this.player.getVolume 记录当前音量，静音时记录上一次音量
        两者是不一定一致的。
         */
        return this.volume;
    },
    //窗口全屏
    requestFullScreen: function(element) {
        var requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullScreen;
        if (requestMethod) {
            requestMethod.call(element);
        } else if (typeof window.ActiveXObject !== "undefined") {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{F11}");
            }
        }
    },
    //窗口全屏video处理
    fullScreenVideoChange: function(element) {
        this.isFullScreen = true;
        $('.h5player-fullscreen').addClass('h5player-fullscreen-ing')
            .find('.controlbar-tip').text('退出全屏');

        $('.live-h5player-video-box').css({
            'width': '100%'
        });
        this.videoFullScreenWidth = 0;
    },
    //退出窗口全屏
    exitFullScreen: function() {
        var exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullScreen;
        if (exitMethod) {
            exitMethod.call(document);
        } else if (typeof window.ActiveXObject !== "undefined") {
            var wscript = new ActiveXObject("WScript.Shell");
            if (wscript !== null) {
                wscript.SendKeys("{ESC}");
            }
        }
    },
    //退出窗口全屏video处理
    exitFullScreenVideoChange: function() {
        this.isFullScreen = false;
        $('.h5player-fullscreen').removeClass('h5player-fullscreen-ing')
            .find('.controlbar-tip').text('窗口全屏');;
        if ((this.videoRotateDeg / 90) % 2 == 1) {
            $('.live-h5player-video-box').css({
                'width': this.videoHeight
            });
        } else {
            $('.live-h5player-video-box').css({
                'width': '100%'
            });
        }
        //设置为0 防止退出全屏后窗口宽高变化
        this.videoWidth = 0;
    },
    //检查当前是否全屏，不用this.isFullScreen是因为esc按键退出全屏isFullScreen始终为true
    checkFull: function() {
        var isFull = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
        if (isFull === undefined) isFull = false;
        return isFull;
    },
    setStreamDefinition: function(index, def) {
        $('.definition-item').eq(index).addClass('active').siblings('.definition-item').removeClass('active');
        $('.definition-text').attr('class', 'definition-text definition-' + def);
    }


};