/*
h5播放器入口
 */
function h5player(params){
	this.roomId = params.roomId||'';
	this.videoId = params.videoId||'';
	this.host = params.host||'https://chushou.tv';
	this.playerInit();
}
h5player.prototype = {
	playerInit:function(){
		if(flvjs.isSupported()){
			this.h5liveplayerInit();
		}else{
			alert('浏览器不支持flvjs播放');
		}
	},
	//播放初始化
	h5liveplayerInit:function(){
		var params = {
			roomId:this.roomId,
			host:this.host,
			videoId:this.videoId
		}
		var self = this;
		this.h5liveplay = new h5liveplay(params);
		this.controlBarInit(this.h5liveplay);
	},
	//控制栏初始化
	controlBarInit:function(player){
		this.controlbar = new h5playerControlBar(player,this.videoId);
	}
};