/*
h5播放器播放业务
 */
function H5playerLive(params, callback) {
    this.roomId = params.roomId;
    this.host = params.host;
    this.videoId = params.videoId;
    this.callback = callback;
    this.stream = null;
    this.COOKIE_NAME = params.cookieName; //cookie名
    this.COOKIE_EXPIRE_DAYS = params.cookieExpireDays; //cookie过期天数
    this.DEFAULT_VOLUME = params.defaultVolume; // 默认音量
    this.main = params.main;
    this.isLiving = false;
    this.waitingTime = null;
    this.waitingTimeProtectSwitch = false; //缓冲保护，前期先关闭
    this.WAITING_TIME = 60 * 1000; //断流等待时长
    this.getLiveStreamUrl(true, callback);
}
H5playerLive.prototype = {
    //load播放器
    flvjsPlayerLoad: function(obj, config, callback) {
        var self = this;
        this.playerDestroy(function() {
            var video = document.getElementById(self.videoId);
            self.video = video;
            self.videoEvent();
            self.player = flvjs.createPlayer(obj, config);
            self.player.attachMediaElement(video);
            self.player.load();
            self.logControl();
            self.player.on(flvjs.Events.LOADING_COMPLETE, function() {
                h5playerLog('LOADING_COMPLETE', 2);
                //兼容 firefox关闭或切换标签页瞬间触发LOADING_COMPLETE导致显示流中断界面 的问题
                if(!H5player.isThisBrowser('firefox')){
                    self.interrupt();
                    clearInterval(self.waitingTime);
                }
            })
            self.player.on(flvjs.Events.METADATA_ARRIVED, function(e) {
                h5playerLog('METADATA_ARRIVED', 2);
            })
            self.player.on(flvjs.Events.RECOVERED_EARLY_EOF, function() {})
            self.player.on(flvjs.Events.SCRIPTDATA_ARRIVED, function() {})
            self.player.on(flvjs.Events.STATISTICS_INFO, function() {})
            self.player.on(flvjs.Events.MEDIA_INFO, function() {
                self.main.onGetMideaInfo(self.player.mediaInfo);
            })
            self.player.on(flvjs.Events.ERROR, function(e) {
                h5playerLog('err:'+e, 4);
            })
            if (typeof callback === 'function') {
                callback(self.player.mediaInfo);
            }
        });
    },
    logControl: function() {
        var logDebugSwitch = this.main.logDebugSwitch;
        flvjs.LoggingControl.enableVerbose = logDebugSwitch;
        flvjs.LoggingControl.enableInfo = logDebugSwitch;
        flvjs.LoggingControl.enableWarn = logDebugSwitch;
        flvjs.LoggingControl.enableError = logDebugSwitch;
    },
    videoEvent: function() {
        var self = this;
        this.video.onloadstart = function() {
            $('.live-opening').show();
        };
        this.video.onloadeddata = function() {};
        this.video.onprogress = function(e) {
        };
        this.video.oncanplay = function() {
            h5playerLog('oncanplay', 1);
            $('.live-opening').hide();
            clearInterval(self.waitingTime);
            //兼容firefox不触发oncanplaythrough的问题
            if (self.video.readyState >= 3) {
                $('.live-loading').hide();
            }
        };
        this.video.oncanplaythrough = function() {
            h5playerLog('oncanplaythrough', 1);
            h5playerLog(self.player.currentTime+','+self.player.buffered.length+','+self.player.buffered.start(0)+','+self.player.buffered.end(0), 1);
            $('.live-loading').hide();
            self.pauseProtect();
        };
        this.video.onwaiting = function() {
            $('.live-opening').hide();
            $('.live-loading').show();
            h5playerLog('waiting..', 1);
            self.waitingHandler();
        };
    },
    //safari浏览器oncanplaythrough后概率性出现画面暂停问题
    pauseProtect:function(){
        if(H5player.isThisBrowser('safari') && this.video.paused){
            h5playerLog('trigger safari pause protect', 3);
            this.play();
        }
    },
    //缓冲超过5秒则重新载入
    waitingHandler: function() {
        var self = this;
        clearInterval(this.waitingTime);
        this.waitingTimeStart = Date.now();
        this.waitingTime = setInterval(function() {
            var nowdata = Date.now();
            if (nowdata - self.waitingTimeStart > self.WAITING_TIME) {
                clearInterval(self.waitingTime);
                self.interrupt();
            }
        }, 1000)
    },
    //回收播放器
    playerDestroy: function(callback) {
        if (this.player) {
            this.isLiving = false;
            this.player.pause();
            this.player.destroy();
            this.player = null;
        }
        if (callback) {
            callback();
        }
    },
    checkAutoPlay: function(callback) {
        var promise = document.querySelector('video').play();
        if (promise !== undefined) {
            promise.then(function() {
                callback();
            }).catch(function(error) {
                //可能为下播或者流中断的playerDestroy导致，无需提示自动播放
                try {
                    if (error.message.indexOf('interrupted by a call to pause') > -1) {
                        return;
                    }
                } catch (e) {

                }
                h5playerLog(JSON.stringify(error), 3);
                $('.h5player-unsupport-autoplay').show();
            })
        }
    },
    //播放
    play: function() {
        var self = this;
        this.checkAutoPlay(function() {
            if (self.player) {
                try {
                    self.isLiving = true;
                    self.player.play();
                } catch (e) {
                    window.console && console.log(e);
                }
            }
        });
    },
    //暂停
    pause: function() {
        if (this.player) {
            this.isLiving = false;
            this.player.pause();
        }
    },
    //重新载入
    refresh: function() {
        if (this.stream) {
            this.setPlayUrl(this.stream.getCurrentStreamUrl());
        }
    },
    //初始化设置播放器声音
    initPlayerSound: function() {
        var isMute = this.getIsMute();
        var volume = this.getVolume();
        if (isMute) {
            this.setVolume(0);
        } else {
            if (volume == '') {
                this.setVolume(this.DEFAULT_VOLUME);
            } else {
                this.setVolume(volume);
            }
        }
    },
    getVolume: function() {
        var volume = this.getCookie('volume');
        return volume == '' ? this.DEFAULT_VOLUME : volume;
    },
    //设置音量 val 0-100
    setVolume: function(val) {
        if (this.video) {
            if (val < 0) {
                val = 0;
            } else if (val > 100) {
                val = 100;
            }
            this.video.volume = val / 100.0;
        }
        if (val > 0) {
            this.setCookie('mute', false);
        }
        this.setCookie('volume', val);
    },
    getIsMute: function() {
        var isMute = this.getCookie('mute');
        return isMute == '' ? false : isMute;
    },
    setMute: function() {
        if (this.video) {
            this.video.volume = 0;
        }
        this.setCookie('mute', true);
    },
    cancelMute: function() {
        if (this.video) {
            var volume = this.getVolume();
            this.video.volume = volume;
        }
        this.setCookie('mute', false);
    },
    getCurrentTime: function(callback) {
        if (this.player.buffered.length > 0) {
            callback(this.player.buffered.end(0))
        } else {
            callback(null);
        }
    },
    seekTo: function(currentTime) {
        if (currentTime) {
            this.player.currentTime = parseFloat(currentTime) - 1;
        }
    },
    /*
    获取直播流地址 
    needStream 是否需要重新取流
    初始化播放器或者重新开播时取新流地址，needNewStream:true
     */
    getLiveStreamUrl: function(needNewStream, callback) {
        var self = this;
        var params = {
            roomId: this.roomId,
            host: this.host
        }
        this.setOffLive(false);
        if (this.stream && !needNewStream) {
            this.refresh();
            if (callback) {
                callback(self);
            }
        } else {
            this.stream = new H5playerStreamManager(params, function(err) {
                if (err) {
                    callback(self, null, err);
                } else {
                    self.setPlayUrl(self.stream.getCurrentStreamUrl(), function(mediaInfo, urlErr) {
                        if (callback) {
                            callback(self, mediaInfo, urlErr);
                        }
                    });
                }
            });
        }
    },
    //配置flv.js参数
    setPlayUrl: function(url, callback) {
        var self = this;
        var flvjsobj = this.generateFlvObject(url);
        var config = {
            autoCleanupSourceBuffer: true
        };
        if (flvjsobj) {
            this.flvjsPlayerLoad(flvjsobj, config, function(mediaInfo) {
                self.initPlayerSound();
                if (callback && 'function' == typeof callback) {
                    callback(mediaInfo, null);
                }
                setTimeout(function() {
                    self.play();
                }, 100);
            });
        } else {
            if (callback && 'function' == typeof callback) {
                callback(null, '流格式解析错误,url:' + url);
            }
            h5playerLog('流格式解析错误,url:' + url, 4);
        }
    },
    generateFlvObject: function(url) {
        var prefixurl = url.split('?')[0];
        var lastIndex = prefixurl.lastIndexOf('.');
        var format = prefixurl.slice(lastIndex + 1);
        var supportFormat = ["flv"];

        if (supportFormat.indexOf(format) > -1) {
            return {
                type: format,
                url: url,
                isLive: true,
                hasAudio: true,
                hasVideo: true,
                cors: true
            };
        } else {
            return null;
        }
    },
    //获取流数据[{def:'sd',str:'[线路1]标清'}]
    getStreamData: function() {
        if (this.stream) {
            return this.stream.getStreamNameList();
        } else {
            return [];
        }
    },
    //获取当前流index
    getStreamIndex: function() {
        if (this.stream) {
            return this.stream.getCurrentStreamDefinitionIndex();
        } else {
            return 0;
        }
    },
    //切换线路
    setStreamDefinition: function(index, callback) {
        if (this.stream) {
            if (this.stream.setStreamDefinition(index)) { // 可以切换线路
                this.setPlayUrl(this.stream.getCurrentStreamUrl());
                callback();
            }
        }
    },
    setCookie: function(name, value) {
        var h5playerCookie = JSON.parse(this.getCookie(''));
        h5playerCookie[name] = value;
        var cookieValue = JSON.stringify(h5playerCookie);
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + this.COOKIE_EXPIRE_DAYS);
        document.cookie = this.COOKIE_NAME + "=" + cookieValue + ((this.COOKIE_EXPIRE_DAYS == null) ? "" : ";expires=" + exdate.toGMTString());
    },
    //1. name=='' 全部h5player cookie 2. name!='' 指定name cookie
    getCookie: function(name) {
        if (document.cookie.length > 0) {
            var start = document.cookie.indexOf(this.COOKIE_NAME + "=");
            if (start != -1) {
                start = start + this.COOKIE_NAME.length + 1
                var end = document.cookie.indexOf(";", start)
                if (end == -1) {
                    end = document.cookie.length
                }
                if (name == '') {
                    return document.cookie.substring(start, end);
                } else {
                    var h5playerCookie = JSON.parse(document.cookie.substring(start, end));
                    if (typeof h5playerCookie[name] != 'undefined') {
                        return h5playerCookie[name];
                    } else {
                        return '';
                    }
                }

            }
        }
        return name == '' ? "{}" : "";
    },
    //下播，取推荐视频和直播
    offLive: function(roomId, callback) {
        var self = this;
        this.isLiving = false;
        this.setOffLive(true);
        var opts = {
            url: this.host + '/room/get-recommend.htm?roomId=' + roomId,
            type: 'GET',
            cache: false,
            dataType: 'json',
            success: function(data) {
                var appendHtml = {
                    num: 0,
                    html: ''
                };
                if (data.code == 0) {
                    var recDatas = data.data;
                    var dataLen = recDatas.length;
                    if (dataLen != 0) {
                        appendHtml.num = dataLen;
                        var singleClass = (dataLen == 1) ? 'recmmond-single' : '';
                        for (var i = 0; i < dataLen; i++) {
                            var curData = recDatas[i];
                            if (curData.type == 1) {
                                //直播
                                var gender = curData.meta.gender;
                                appendHtml.html += '<a class="recommend-item recommend-item-live singleClass" href="' + self.host + '/room/' + curData.targetKey + '.htm"><img src="' + curData.cover + '" alt="" class="live-over-rec-img"><div class="rec-info-box"><p class="rec-info-title ellipsis">' + escapeString(curData.name) + '</p><div class="rec-info-content"><p class="rec-info-live ellipsis"><i class="live-over-gender-' + gender + '"></i><span class="rec-anchor-name ellipsis">' + escapeString(curData.meta.creator) + '</span><i class="live-over-room-hot"></i><span>' + formateNumber(curData.meta.onlineCount) + '</span></p><p class="rec-info-livearea ellipsis">' + curData.meta.gameName + '</p></div></div><img src="'+MAIN_PIC_PREFIX_PATH+'/h5player/over/angle_icon_live.png" alt="" class="rec-angle-icon angle-icon-live"></a>';
                            } else if (curData.type == 3) {
                                //视频
                                appendHtml.html += ' <a class="recommend-item recommend-item-video singleClass"  href="' + self.host + '/gamezone/video/play/' + curData.targetKey + '.htm"><img src="' + curData.cover + '" alt="" class="live-over-rec-img"><div class="rec-info-box"><p class="rec-info-title ellipsis">' + escapeString(curData.name) + '</p><div class="rec-info-content"><i class="live-over-video-gift"></i><span>' + formateNumber(curData.meta.giftCount) + '</span><i class="live-over-video-play"></i><span>' + formateNumber(curData.meta.playCount) + '</span><i class="live-over-video-comments"></i><span>' + formateNumber(curData.meta.commentCount) + '</span></div></div><img src="'+MAIN_PIC_PREFIX_PATH+'/h5player/over/angle_icon_video.png" alt="" class="rec-angle-icon angle-icon-video"></a>';
                            }
                        }
                    }
                }
                callback(appendHtml);
            }
        };
        $.ajax(opts);
    },
    //直播流中断，可能是下播
    interrupt: function() {
        //已下播则不处理
        if (!this.everOffLive) {
            this.setOffLive(true);
            this.isLiving = false;
            this.playerDestroy();
            $('.live-opening,.live-loading').hide();
            $('.live-interrupt').show();
            $('.h5player-unsupport-autoplay').hide();
        }
    },
    setOffLive: function(status) {
        this.everOffLive = status;
    }
}