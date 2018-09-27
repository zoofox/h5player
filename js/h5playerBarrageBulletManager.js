/*
h5播放器弹幕条目
 */
function h5playerBarrageBulletManager(params,callback){
	this.userUid = params.userUid || '';
	this.store = []; //仓库
	this.callback = callback;
	this.init();
}
h5playerBarrageBulletManager.prototype = {
	init:function(){
		this.bullets = [];
		this.callback(this);
	},
	getBullet:function(barrage,callback){
	},
	getBulletFromStore:function(barrage){
		if(this.store.length == 0){
			return null;
		}else{
			var notFoundBullet = false;
			var bullet = null;
			
		}
	}
	,
	inStore:function(bullet){
		this.store.push(bullet);
	},
	getStoreReadyBullets:function(callback){
		if(this.store.length == 0){
			callback({
				count: 0,
				bullets:[]
			});
		}else{
			var readyBullets = this.store.filter(function(bullet){
				return bullet && !bullet.isBusy;
			})
			callback({
				count: readyBullets.length,
				bullets:readyBullets
			});
		}
	}
	,
	getStoreLength:function(){
		return this.store.length;
	},
	storeIsEmpty:function(){
		return this.store.length == 0?true:false;
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