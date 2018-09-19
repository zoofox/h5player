/*
h5播放器弹幕弹道
 */
function h5playerBarrageTunnelManager(params,callback){
	this.videoId = params.videoId;
	this.singleTunnelHeight = params.singleTunnelHeight; //弹幕轨道高度
	this.tunnelCount = 0;
	this.callback = callback;
	this.init();
}

h5playerBarrageTunnelManager.prototype = {
	init:function(){
		this.calculateTunnelCount();
		if(this.callback){
			this.callback(this);
		}
	},
	calculateTunnelCount:function(){
		var videoIdHeight = $('#'+this.videoId).height();
		this.tunnelCount  = Math.floor(videoIdHeight / this.singleTunnelHeight);
		this.tunnels = [];
		for(var i=0;i<this.tunnelCount;i++){
			this.tunnels.push({
				id:i,
				ready:true
			})
		}
		h5playerLog('tunnel count:'+this.tunnelCount,1);
	},
	hasTunnelReady:function(){
		var tunnelReadyCount = 0;
		this.readyTunnels = this.tunnels.filter(function(tunnel){
			return tunnel && tunnel.ready;
		})
		tunnelReadyCount = this.readyTunnels.length;
		return tunnelReadyCount;
	},
	getTunnel:function(index,callback){
		try{
			callback(this.readyTunnels[index]);
		}catch(e){
			h5playerLog('get tunnel error,tunnel index:'+index+',e:'+e,4);
			callback(null);
		}
	},
	setTunnelStatus:function(tunnelid,status){
		this.tunnels[tunnelid].ready = status;
		console.log('set tunnel '+tunnelid+' ready state:'+status)
	}
}