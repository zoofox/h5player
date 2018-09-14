/*
h5播放器弹幕
 */
function h5playerBarrage(params,callback){
	this.player = params.player;
	this.callback = callback;
	this.barrageInit(params);
	
}
h5playerBarrage.prototype = {
	barrageInit:function(params){
		this.barrageSwitch = this.getBarrageParam('barrageSwitch')||params.barrageSwitch; //弹幕开关 0关 1开
		this.barrageFullscreenInputSwitch = this.getBarrageParam('barrageFullscreenInputSwitch')||params.barrageFullscreenInputSwitch; //弹幕开关 0关 1开
		this.barrageOpacity = this.getBarrageParam('barrageOpacity')||params.barrageOpacity; //弹幕透明度 0无 1低 2中 3高
		this.barragePosition = this.getBarrageParam('barragePosition')||params.barragePosition; //弹幕位置 0全屏 1顶端 2底端
		this.barrageConfig = {
			barrageSwitch:this.barrageSwitch,
			barrageFullscreenInputSwitch:this.barrageFullscreenInputSwitch,
			barrageOpacity:this.barrageOpacity,
			barragePosition:this.barragePosition
		}
		this.callback(this);
	},
	getBarrageParam:function(name){
		if(this.player && name != ''){
			return this.player.getCookie(name);
		}else{
			return '';
		}
	},
	setBarrageParam:function(name,value){
		if(this.player){
			this.player.setCookie(name,value);
			this.barrageConfig[name] = value;
		}
	},
	getAllBarrageParams:function(){
		return this.barrageConfig;
	}
}