function h5playerBarrageTunnel(params,callback){
	this.videoId = params.videoId;
	this.singleTunnelHeight = params.singleTunnelHeight; //弹幕轨道高度
	this.tunnelCount = 0;
	this.callback = callback;
	this.init();
}

h5playerBarrageTunnel.prototype = {
	init:function(){
		this.calculateTunnelCount();
		if(this.callback){
			this.callback(this);
		}
	},
	calculateTunnelCount:function(){
		var videoIdHeight = $('#'+this.videoId).height();
		this.tunnelCount  = Math.floor(videoIdHeight / this.singleTunnelHeight);
		h5playerLog('tunnel count:'+this.tunnelCount,1);

	}
}