/*
h5播放器播放业务
 */
function h5playerLive(params,callback){
	this.roomId = params.roomId;
    this.host = params.host;
    this.videoId = params.videoId;
    this.callback = callback;
    this.stream = null;
    this.COOKIE_NAME = params.cookieName; //cookie名
    this.COOKIE_EXPIRE_DAYS = params.cookieExpireDays; //cookie过期天数
    this.DEFAULT_VOLUME = params.defaultVolume; // 默认音量
    this.getLiveStreamUrl();
}
h5playerLive.prototype = {
	//load播放器
	flvjsPlayerLoad:function(obj,callback){
		this.playerDestroy();
		var video = document.getElementById(this.videoId);
		this.video = video;
        this.player = flvjs.createPlayer(obj);
        this.player.attachMediaElement(video);
        this.player.load();
        if(typeof callback === 'function'){
        	callback();
        }
	},
	//回收播放器
	playerDestroy:function(){
		if(this.player) {
	        this.player.pause();
	        this.player.destroy();
	        this.player = null;
	    }
	},
	//播放
	play:function(){
		if(this.player){
			this.player.play();
		}
	}
	,
	//暂停
	pause:function(){
		if(this.player){
			this.player.pause();
		}
	},
	//重新载入
	refresh:function(){
		if(this.stream){
			this.setPlayUrl(this.stream.getCurrentStreamUrl());
		}
	},
	//初始化设置播放器声音
	initPlayerSound:function(){
		var isMute = this.getIsMute();
		var volume = this.getVolume();
		if(isMute){
			this.setVolume(0);
		}else{
			if(volume ==''){
				this.setVolume(this.DEFAULT_VOLUME);
			}else{
				this.setVolume(volume);
			}
		}
	},
	getVolume:function(){
		var volume = this.getCookie('volume');
		return volume==''?this.DEFAULT_VOLUME:volume;
	},
	//设置音量 val 0-100
	setVolume:function(val){
		if(this.video) {
	        if(val < 0) {
	            val = 0;
	        } else if(val > 100) {
	            val = 100;
	        }
	        this.video.volume = val / 100.0;
	    }
	    if(val > 0) {
	        this.setCookie('mute',false);
	    }
	    this.setCookie('volume',val);
	},
	getIsMute:function(){
		var isMute = this.getCookie('mute');
		return isMute==''?false:isMute;
	}
	,
	setMute:function(){
		 if(this.video){
		 	this.video.volume = 0;
		 }
		 this.setCookie('mute',true);
	},
	cancelMute:function(){
		if(this.video){
			var volume = this.getVolume();
		 	this.video.volume = volume;
		 }
		this.setCookie('mute',false);
	}
	,
	//获取直播流地址
	getLiveStreamUrl:function(){
		var self = this;
		var params = {
			roomId:this.roomId,
			host:this.host
		}
		this.stream = new StreamManager(params,function(){
			if(self.callback){
				self.callback(self);
			}
			 self.setPlayUrl(self.stream.getCurrentStreamUrl());
		});
	},
	//配置flv.js参数
	setPlayUrl:function(url){
		var self = this;
		var flvjsobj = this.generateFlvObject(url);
		if(flvjsobj){
			this.flvjsPlayerLoad(flvjsobj,function(){
				self.initPlayerSound();
				self.play();
			});
		}else{
			window.console&&console.log('格式错误');
		}
	},
	generateFlvObject:function(url){
		var prefixurl = url.split('?')[0];
		var lastIndex = prefixurl.lastIndexOf('.');
		var format = prefixurl.slice(lastIndex+1);
		var supportFormat = ["mp4","flv","mov","m3u8"];

		if(supportFormat.indexOf(format)>-1) {
                return {type:format, url:url};
        }else{
        	return null;
        }
	},
	//获取流数据[{def:'sd',str:'[线路1]标清'}]
	getStreamData:function(){
		if(this.stream){
			return this.stream.getStreamNameList();
		}else{
			return [];
		}
	},
	//获取当前流index
	getStreamIndex:function(){
		if(this.stream){
			return this.stream.getCurrentStreamDefinitionIndex();
		}else{
			return 0;		
		}
	},
	//切换线路
	setStreamDefinition:function(index,callback){
		if(this.stream) {
	        if(this.stream.setStreamDefinition(index)) {    // 可以切换线路
	            this.setPlayUrl(this.stream.getCurrentStreamUrl());
	            callback();
	        }
	    }
	}
	,
	setCookie:function(name,value){
		var h5playerCookie = JSON.parse(this.getCookie(''));
	    h5playerCookie[name] = value;
	    var cookieValue = JSON.stringify(h5playerCookie);
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + this.COOKIE_EXPIRE_DAYS);
		document.cookie = this.COOKIE_NAME + "=" + cookieValue + ((this.COOKIE_EXPIRE_DAYS == null) ? "" : ";expires=" + exdate.toGMTString());
	},
	getCookie:function(name){
		if (document.cookie.length > 0) {
	    	var start = document.cookie.indexOf(this.COOKIE_NAME + "=");
		    if (start != -1) {
		      	start = start + this.COOKIE_NAME.length + 1
		      	var end = document.cookie.indexOf(";", start)
		      	if (end == -1){
		      		end = document.cookie.length
		      	}
		      	if(name == ''){
		      		return document.cookie.substring(start, end);
		      	}else{
		      		var h5playerCookie = JSON.parse(document.cookie.substring(start, end));
		      		return h5playerCookie[name]?h5playerCookie[name]:'';
		      	}
		      	
		    }
	  }
	  return name==''?"{}":"";
	}

}
