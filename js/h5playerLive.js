/*
h5播放器播放业务
 */
function h5playerLive(params, callback) {
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
    this.getLiveStreamUrl();
}
h5playerLive.prototype = {
    //load播放器
    flvjsPlayerLoad: function(obj, callback) {
        var self = this;
        this.playerDestroy(function() {
            var video = document.getElementById(self.videoId);
            self.video = video;
            self.videoEvent();
            self.player = flvjs.createPlayer(obj, {
                enableStashBuffer: false,
                isLive: true
            });
            self.player.attachMediaElement(video);
            self.player.load();
            self.player.on(flvjs.Events.LOADING_COMPLETE, function() {
                console.log('下播...')
            })
            self.player.on(flvjs.Events.METADATA_ARRIVED, function(e) {
                alert('METADATA_ARRIVED')
            })
            self.player.on(flvjs.Events.RECOVERED_EARLY_EOF, function() {
                alert('RECOVERED_EARLY_EOF')
            })
            self.player.on(flvjs.Events.SCRIPTDATA_ARRIVED, function() {
                alert('SCRIPTDATA_ARRIVED')
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
    videoEvent: function() {
        var self = this;
        this.video.onloadstart = function() {
            $('.live-opening').show();
            console.log('on load start')
        };
        this.video.onloadeddata = function() {
            console.log('loading');
        };
        this.video.onprogress = function(e) {
            // console.log('onprogress');
        };
        this.video.oncanplay = function() {
            $('.live-opening').hide();
            self.isLiving = true;
            console.log('oncanplay');
        };
        this.video.oncanplaythrough = function() {
            console.log('oncanplaythrough')
            $('.live-loading').hide();
        };
        this.video.onwaiting = function() {
            $('.live-opening').hide();
            $('.live-loading').show();
            console.log('waiting');
        };
    },
    //回收播放器
    playerDestroy: function(callback) {
        if (this.player) {
            this.player.pause();
            this.player.destroy();
            this.player = null;
        }
        if (callback) {
            callback();
        }
    },
    checkAutoPlay:function(callback){
    	var promise = document.querySelector('video').play();
		if (promise !== undefined) {  
		    promise.then(function(){
		    	callback();
		    }).catch(function(error){
		    	$('.h5player-unsupport-autoplay').show();
		    })
		}
    },
    //播放
    play: function() {
    	var self = this;
    	this.checkAutoPlay(function(){
    		if (self.player) {
	        	try{
	            	self.player.play();
	        	}catch(e){
	        		window.console&&console.log(e);
	        	}
	        }
    	});
    },
    //暂停
    pause: function() {
        if (this.player) {
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
    getLiveStreamUrl: function() {
        var self = this;
        var params = {
            roomId: this.roomId,
            host: this.host
        }
        this.stream = new h5playerStreamManager(params, function() {
            self.setPlayUrl(self.stream.getCurrentStreamUrl(), function(mediaInfo) {
                if (self.callback) {
                    self.callback(self, mediaInfo);
                }
            });
        });
    },
    //配置flv.js参数
    setPlayUrl: function(url, callback) {
        var self = this;
        var flvjsobj = this.generateFlvObject(url);
        if (flvjsobj) {
            this.flvjsPlayerLoad(flvjsobj, function(mediaInfo) {
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
    }

}