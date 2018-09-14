/*
h5播放器入口
 */
function h5player(params){
	this.roomId = params.roomId||'';
	this.videoId = params.videoId||'';
	this.host = params.host||'https://chushou.tv';
	this.COOKIE_NAME = 'h5player'; //cookie名
    this.COOKIE_EXPIRE_DAYS = 7; //cookie过期天数
    this.DEFAULT_VOLUME = 50; // 默认音量
    this.DEFAULT_BARRAGE_SWITCH = 1;//弹幕开关
    this.DEFAULT_BARRAGE_OPACITY = 0;//0无 1低 2中 3高
    this.DEFAULT_BARRAGE_POSITION = 0; //0全屏 1顶端 2底端
	this.playerInit();
}
h5player.prototype = {
	playerInit:function(){
		var self = this;
		if(flvjs.isSupported()){
			this.h5liveplayerInit(function(){
				self.barrageInit(function(){
					self.controlBarInit(function(){
						window.console&&console.log('h5player already...');
					});
				})
			});
		}else{
			alert('浏览器不支持flvjs播放');
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
			defaultVolume:this.DEFAULT_VOLUME
		};
		var self = this;
		new h5playerLive(params,function(player){
			self.player = player;
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
			barrageOpacity:this.DEFAULT_BARRAGE_OPACITY,
			barragePosition:this.DEFAULT_BARRAGE_POSITION,
			cookieName:this.COOKIE_NAME,
			cookieExpireDays:this.COOKIE_EXPIRE_DAYS
		};
		new h5playerBarrage(params,function(barrage){
			self.barrage = barrage;
			callback();
		});
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
	}
};