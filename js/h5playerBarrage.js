/*
h5播放器弹幕
 */
function h5playerBarrage(params,callback){
	this.player = params.player;
	this.barrageSwitch = params.barrageSwitch; //弹幕开关
	this.barrageOpacity = params.barrageOpacity; //0无 1低 2中 3高
	this.barragePosition = params.barragePosition; //0全屏 1顶端 2底端
	this.COOKIE_NAME = params.cookieName; //cookie名
    this.COOKIE_EXPIRE_DAYS = params.cookieExpireDays; //cookie过期天数
	this.callback = callback;
	callback(this);
}
h5playerBarrage.prototype = {

}