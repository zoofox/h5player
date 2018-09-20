/*
h5播放器弹幕条目
 */
function h5playerBarrageBulletManager(params,callback){
	this.userUid = params.userUid || '';
	this.callback = callback;
	this.init();
}
h5playerBarrageBulletManager.prototype = {
	init:function(){
		this.bullets = [];
		this.callback(this);
	},
	//无限produce会有性能问题.是否应该复用？how?
	produce:function(barrage,callback){
		switch(barrage.type){
			case 1: //普通弹幕
				var itemselfCls = barrage.uid==this.userUid?'h5player-barrage-item-self':'';
				var barrageHtml = '<div style="tmpstyle" class="h5player-barrage-item '+itemselfCls+'"></div>';
				callback({
					bulletDom:$(barrageHtml),
					isBusy:true,
					content:barrage.content
				});
				break;
		}
	}
}