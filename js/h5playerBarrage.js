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
		var bs = this.getBarrageParam('barrageSwitch');
		var bfis = this.getBarrageParam('barrageFullscreenInputSwitch');
		var bo = this.getBarrageParam('barrageOpacity');
		var bp = this.getBarrageParam('barragePosition');
		this.barrageConfig = {
			barrageSwitch:bs===''?params.barrageSwitch:bs,//弹幕开关 0关 1开
			barrageFullscreenInputSwitch:bfis===''?params.barrageFullscreenInputSwitch:bfis,//全屏弹幕输入开关 0关 1开
			barrageOpacity:bo===''?params.barrageOpacity:bo,//弹幕透明度 0无 1低 2中 3高
			barragePosition:bp===''?params.barragePosition:bp//弹幕位置 0全屏 1顶端 2底端
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