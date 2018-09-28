/*
h5播放器弹幕弹道
 */
function h5playerBarrageTunnelManager(params,callback){
	this.videoId = params.videoId;
	this.singleTunnelHeight = params.singleTunnelHeight; //弹幕轨道高度
	this.barragePosition = params.barragePosition;
	this.tunnelCount = 0;
	this.BARRAGE_POSITION_NOTFULL_SCREEN = 0.3;//弹幕非全屏时显示比例
	this.callback = callback;
	this.init();
}

h5playerBarrageTunnelManager.prototype = {
	init:function(){
		this.calculateTunnelCount(this.barragePosition);
		if(this.callback){
			this.callback(this);
		}
	},
	calculateTunnelCount:function(position,callback){
		var videoIdHeight = $('#'+this.videoId).height();
		var tunnelHeight = videoIdHeight;
		if(position != 0){
			tunnelHeight = tunnelHeight * this.BARRAGE_POSITION_NOTFULL_SCREEN;
		}
		this.tunnelCount  = Math.floor(tunnelHeight / this.singleTunnelHeight);
		this.tunnels = [];
		for(var i=0;i<this.tunnelCount;i++){
			this.tunnels.push({
				id:i,
				ready:true
			})
		}
		if('function' == typeof callback){
			callback();
		}
		h5playerLog('tunnel count:'+this.tunnelCount,1);
	},
	tunnelPositionChange:function(position,callback){
		this.calculateTunnelCount(position,function(){
			callback();
		})
	}
	,
	getTunnelReady:function(callback){
		var readyTunnels = this.tunnels.filter(function(tunnel){
			return tunnel && tunnel.ready;
		})
		callback({
			count: readyTunnels.length,
			tunnels:readyTunnels
		});
	},
	setTunnelStatus:function(tunnelid,status){
		try{
			this.tunnels[tunnelid].ready = status;
			console.log('set tunnel '+tunnelid+' ready state:'+status)
		}catch(e){
			console.log(e)
		}
		
		
	}
}