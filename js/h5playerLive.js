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
    this.getLiveStreamUrl(callback);
    this.waitingTime = null;
    this.waitingTimeProtectSwitch = false; //缓冲保护，前期先关闭
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
                h5playerLog('LOADING_COMPLETE',2);
                self.interrupt();
                clearInterval(self.waitingTime);
            })
            self.player.on(flvjs.Events.METADATA_ARRIVED, function(e) {
                h5playerLog('METADATA_ARRIVED', 2);
            })
            self.player.on(flvjs.Events.RECOVERED_EARLY_EOF, function() {
            })
            self.player.on(flvjs.Events.SCRIPTDATA_ARRIVED, function() {
            })
            self.player.on(flvjs.Events.STATISTICS_INFO, function() {})
            self.player.on(flvjs.Events.MEDIA_INFO, function() {
                self.main.onGetMideaInfo(self.player.mediaInfo);
            })
            self.player.on(flvjs.Events.ERROR, function(e) {
                h5playerLog(e, 4);
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
        this.video.onloadeddata = function() {
        };
        this.video.onprogress = function(e) {};
        this.video.oncanplay = function() {
            $('.live-opening').hide();
            clearInterval(self.waitingTime);
            //兼容firefox不触发oncanplaythrough的问题
            if (self.video.readyState >= 3) {
                $('.live-loading').hide();
            }
        };
        this.video.oncanplaythrough = function() {
            $('.live-loading').hide();
        };
        this.video.onwaiting = function() {
            $('.live-opening').hide();
            $('.live-loading').show();
            if(self.waitingTimeProtectSwitch){
                self.waitingHandler();
            }
        };
    },
    //缓冲超过5秒则重新载入
    waitingHandler: function() {
        var self = this;
        clearInterval(this.waitingTime);
        this.waitingTimeStart = Date.now();
        this.waitingTime = setInterval(function() {
            var nowdata = Date.now();
            if (nowdata - self.waitingTimeStart > 5000) {
                clearInterval(self.waitingTime);
                self.refresh();
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
            self.isLiving = false;
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
    //获取直播流地址
    getLiveStreamUrl: function(callback) {
        var self = this;
        var params = {
            roomId: this.roomId,
            host: this.host
        }
        if (this.stream) {
            this.refresh();
        } else {
            this.stream = new H5playerStreamManager(params, function() {
                self.setPlayUrl(self.stream.getCurrentStreamUrl(), function(mediaInfo) {
                    if (callback) {
                        callback(self, mediaInfo);
                    }
                });
            });
        }

    },
    //配置flv.js参数
    setPlayUrl: function(url, callback) {
        var self = this;
        var flvjsobj = this.generateFlvObject(url);
        var config = {
            enableStashBuffer: false,
            enableWorker: true,
            autoCleanupSourceBuffer:true
        };
        if (flvjsobj) {
            this.flvjsPlayerLoad(flvjsobj, config, function(mediaInfo) {
                self.initPlayerSound();
                if (callback && 'function' == typeof callback) {
                    callback(mediaInfo);
                }
                setTimeout(function() {
                    self.play();
                }, 100);
            });
        } else {
            window.console && console.log('格式错误');
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
    offLive:function(roomId,callback){
        var self = this;
        console.log('-------')
        this.isLiving = false;
        var opts = {
            url:this.host+'/room/get-recommend.htm?roomId='+roomId,
            type:'GET',
            cache:false,
            dataType:'json',
            success:function(data){
                // var data = JSON.parse('{"code":0,"message":"","data":[{"id":-1,"panelId":-1,"type":3,"name":"王者归来，君临天下","meta":{"creator":"mds丶剑仙","gender":"male","displayTag":"王者荣耀","upCount":36214,"timelineId":4041145,"giftCount":16845,"avatar":"http://kascdn.kascend.com/jellyfish/avatar/20160715/51821220_1468539459405.jpg!jellyfishavatar","commentCount":8563,"duration":"03:40","uid":51821220,"playCount":5913423,"hasUp":false,"createdTime":1498746447000},"cover":"http://v0103.kascend.com/jellyfish/game/video/51821220/1498745537715.jpg","targetKey":"2058834","desc":"","order":-1,"style":5,"categoryId":-1,"startTime":null,"endTime":null,"state":-1,"createdTime":null,"updatedTime":null,"display":0,"hot":1,"scope":1,"cornerMark":-1,"show":true,"categorySpecified":false},{"id":-1,"panelId":-1,"type":1,"name":"排位排位，优秀鸭！","meta":{"onlineCount":33665,"creator":"小凡☄","gender":"male","liveType":1,"liveTagName":"巅峰王者","gameTargetKey":"3-1159-3","avatar":"http://kascdn.kascend.com/jellyfish/avatar/490285602/1528279442804.jpg!jellyfishavatar","roomId":32331188,"professional":1,"gameName":"王者荣耀","subscriberCount":191597,"gameCtxPath":"pvp","live":true},"cover":"http://sc-live.kascend.com/jellyfish/20/32331188/1540964857729.jpg","targetKey":"32331188","desc":"","order":-1,"style":1,"categoryId":-1,"startTime":null,"endTime":null,"state":-1,"createdTime":null,"updatedTime":null,"display":0,"hot":1,"scope":1,"cornerMark":-1,"show":true,"categorySpecified":false}]}')
                var appendHtml = '';
                if(data.code == 0){
                    var recDatas = data.data;
                    if(recDatas.length!=0){
                        for(var i=0,len = recDatas.length;i<len;i++){
                            var curData = recDatas[i];
                            if(curData.type == 1){
                            //直播
                                var gender = curData.meta.gender;
                                appendHtml+='<a class="recommend-item recommend-item-live" href="'+self.host+'/room/'+curData.targetKey+'.htm"><img src="'+curData.cover+'" alt="" class="live-over-rec-img"><div class="rec-info-box"><p class="rec-info-title ellipsis">'+escapeString(curData.name)+'</p><div class="rec-info-content"><p class="rec-info-live ellipsis"><i class="live-over-gender-'+gender+'"></i><span class="rec-anchor-name ellipsis">'+escapeString(curData.meta.creator)+'</span><i class="live-over-room-hot"></i><span>'+formateNumber(curData.meta.onlineCount)+'</span></p><p class="rec-info-livearea ellipsis">'+curData.meta.gameName+'</p></div></div><img src="./imgs/h5player/over/angle_icon_live.png" alt="" class="rec-angle-icon angle-icon-live"></a>';
                            }else if(curData.type == 3){
                            //视频
                                appendHtml+=' <a class="recommend-item recommend-item-video"  href="'+self.host+'/gamezone/video/play/'+curData.targetKey+'.htm"><img src="'+curData.cover+'" alt="" class="live-over-rec-img"><div class="rec-info-box"><p class="rec-info-title ellipsis">'+escapeString(curData.name)+'</p><div class="rec-info-content"><i class="live-over-video-gift"></i><span>'+formateNumber(curData.meta.giftCount)+'</span><i class="live-over-video-play"></i><span>'+formateNumber(curData.meta.playCount)+'</span><i class="live-over-video-comments"></i><span>'+formateNumber(curData.meta.commentCount)+'</span></div></div><img src="./imgs/h5player/over/angle_icon_video.png" alt="" class="rec-angle-icon angle-icon-video"></a>';
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
    interrupt:function(){
        this.main.destroy();
        $('.live-interrupt').show();
        $('.h5player-unsupport-autoplay').hide();
    }
}

