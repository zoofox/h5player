/*
h5播放器入口
 */
function h5player(params){
	this.h5playerVersion = '0.0.1'; //h5player版本
	this.roomId = params.roomId||'';
	this.videoId = params.videoId||'';
	this.userUid = params.userUid||'';
	this.host = params.host||'https://chushou.tv';
	this.COOKIE_NAME = 'h5player'; //cookie名
    this.COOKIE_EXPIRE_DAYS = 7; //cookie过期天数
    this.DEFAULT_VOLUME = 50; // 默认音量
    this.DEFAULT_BARRAGE_SWITCH = 1;//弹幕开关 0关 1开
    this.DEFAULT_BARRAGE_FULLSCREEN_INPUT_SWITCH = 1;//弹幕全屏输入开关 0关 1开
    this.DEFAULT_BARRAGE_OPACITY = 0;//弹幕透明度 0无 1低 2中 3高
    this.DEFAULT_BARRAGE_POSITION = 0; //弹幕位置 0全屏 1顶端 2底端
    this.SINGLE_TUNNEL_HEIGHT = 36; //弹幕轨道高度，弹幕高度30px
    this.BARRAGE_FLY_SPEED = 120; // 弹幕运行速度px/s
    this.BARRAGE_CHECK_TIME = 300;  //弹幕计时器间隔时长 ms
    this.logDebugSwitch = false; //日志调试开关
    this.BARRAGE_SPEED_MODE = 0; //弹幕速度 0变速 1匀速
    this.BARRAGE_MAX_SPEED = 200; //弹幕最大速度
    this.LONG_BARRAGE_NEED_TIME = 3;//弹幕长度超过屏幕宽度时的默认时长 秒
    this.mediaInfo = {
    	width:1280,
    	height:720
    };
	window.h5playerLogLevel = 0;
	this.playerInit();
}
h5player.prototype = {
	playerInit:function(){
		if(flvjs.isSupported()){
			var self = this;
			this.logInit();
			$('.h5player-rightmenu-item').eq(0).text('HTML5 Live Player v'+this.h5playerVersion);
			this.h5liveplayerInit(function(){
				h5playerLog('live player init finish',2);
				self.barrageInit(function(){
					h5playerLog('barrage init finish',2);
					self.controlBarInit(function(){
						window.console&&console.log('h5player already...');
					});
				})
			});
			self.bind();
		}else{
			alert('浏览器不支持播放');
		}
	},
	//播放初始化
	h5liveplayerInit:function(callback){
		var params = {
			roomId:this.roomId,
			host:this.host,
			videoId:this.videoId,
			cookieName:this.COOKIE_NAME,
			cookieExpireDays:this.COOKIE_EXPIRE_DAYS,
			defaultVolume:this.DEFAULT_VOLUME,
			main:this
		};
		var self = this;
		new h5playerLive(params,function(player,mediaInfo){
			self.player = player;
			if(mediaInfo && mediaInfo.width){
				self.mediaInfo = mediaInfo;
			}
			self.setPlayerSize(self.mediaInfo.width,self.mediaInfo.height);
			callback();
		});
	},
	//控制栏初始化
	controlBarInit:function(callback){
		var params = {
			player:this.player,
			videoId:this.videoId,
			barrage:this.barrage
		};
		var self = this;
		new h5playerControlBar(params,function(controlBar){
			self.controlBar = controlBar;
			callback();
		});
	},
	//弹幕功能初始化
	barrageInit:function(callback){
		var self = this;
		var params = {
			player:this.player,
			videoId:this.videoId,
			barrageSwitch:this.DEFAULT_BARRAGE_SWITCH,
			barrageFullscreenInputSwitch:this.DEFAULT_BARRAGE_FULLSCREEN_INPUT_SWITCH,
			barrageOpacity:this.DEFAULT_BARRAGE_OPACITY,
			barragePosition:this.DEFAULT_BARRAGE_POSITION,
			cookieName:this.COOKIE_NAME,
			cookieExpireDays:this.COOKIE_EXPIRE_DAYS,
			singleTunnelHeight:this.SINGLE_TUNNEL_HEIGHT,
			barrageFlySpeed:this.BARRAGE_FLY_SPEED,
			barrageCheckTime:this.BARRAGE_CHECK_TIME,
			barrageSpeedMode:this.BARRAGE_SPEED_MODE,
			barrageMaxSpeed:this.BARRAGE_MAX_SPEED,
			longBarrageNeedTime:this.LONG_BARRAGE_NEED_TIME,
			userUid:this.userUid
		};
		new h5playerBarrage(params,function(barrage){
			self.barrage = barrage;
			callback();
		});
	},
	setPlayerSize:function(videoWidth,videoHeight){
		var playerWidth = $('#live-h5player-container').width();
		var playerHeight = videoHeight*playerWidth/videoWidth;
		$('#live-h5player-container').css('height',playerHeight);
	}
	,
	switchBack:function(){
		if(this.player){
			this.player.getLiveStreamUrl();
		}
	},
	destroy:function(){
		if(this.player){
			this.player.playerDestroy();
		}
	},
	logInit:function(){
		this.logDebugLevel = this.getUrlParam('h5playerdebug'); //0关闭 1debug 2info 3warn 4error
		this.logDebugSwitch = !isNaN(this.logDebugLevel)&&this.logDebugLevel>0?true:false;
		if(this.logDebugSwitch){
			window.h5playerLog = this.log;
			window.h5playerLogLevel = parseInt(this.logDebugLevel);
		}else{
			window.h5playerLog = function(){
				return;
			}
		}
	}
	,
	log:function(msg,level){
		if(window.console){
			var logLevel = {1:'[debug]',2:'[info]',3:'[warn]',4:'[error]'}
			if(level >= h5playerLogLevel){
				console.log('h5playerlog:'+logLevel[level]+' > '+msg);
			}
		}	
	},
	getUrlParam:function(name){
		 var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		  var r = window.location.search.substr(1).match(reg);
		  if (r != null) return decodeURI(r[2]);
		  return null;
	},
	onGetMideaInfo:function(mediaInfo){
		console.log('mediaInfo----->>>>>')
		this.mediaInfo = mediaInfo;
		this.setPlayerSize(mediaInfo.width,mediaInfo.height);
	}
	,
	bind:function(){
		var self = this;
		$(window).resize(function() {
			self.setPlayerSize(self.mediaInfo.width,self.mediaInfo.height);
            if(self.barrage && self.barrage.tunnelManager){
            		//重新计算弹幕轨道区域大小
            		 self.barrage.tunnelManager.calculateTunnelCount(self.barrage.barrageConfig.barragePosition,function(activeTunnels,nowActiveCount,lastActiveCount){
            		 	//缩小则隐藏多余弹幕
            		 	if(lastActiveCount > nowActiveCount || self.barrage.barrageConfig.barragePosition==2){
            		 		var startIndex = activeTunnels[activeTunnels.length-1].index+1;
            		 		self.barrage.bulletManager.hide(startIndex,-1,function(){
            		 		})
            		 	}
                	})
            }
        })
	}
};