/*
h5播放器弹幕条目
 */
function h5playerBarrageBulletManager(params, callback) {
    this.userUid = params.userUid || '';
    this.store = []; //仓库
    this.callback = callback;
    this.init();
}
h5playerBarrageBulletManager.prototype = {
    init: function() {
        this.bullets = [];
        this.callback(this);
    },
    inStore: function(bullet) {
        this.store.push(bullet);
    },
    clearStore:function(){
    	this.store = [];
    }
    ,
    //检查仓库是否有可用bullet，不够则生产新的
    getBullets: function(barrages, callback) {
    	var self = this;
        var barragesLength = barrages.length;
        //需要一个回收方法 来减小这里的开销...
        var readyBullets = this.store.filter(function(bullet) {
            return bullet && !bullet.isBusy;
        })
        // console.log('need count:'+barrages.length,'store count:'+this.store.length,'not busy count:'+readyBullets.length);

        var readyBulletsLength = readyBullets.length;
        if (readyBulletsLength >= barragesLength) {
            var bufferBullets = readyBullets.slice(0, barragesLength);
            this.reformBullets(bufferBullets, barrages, function(bullets) {
                callback({
                    count: barragesLength,
                    bullets: bullets
                });
            })
        } else {
        	 //仓库不够，需要新生产
        	this.reformBullets(readyBullets, barrages.slice(0,readyBulletsLength), function(bullets) {
                var produceLength = barragesLength - readyBulletsLength;
	            var barragesProduce = barrages.slice(readyBulletsLength);
	            var produceBullets = [];
	            for (var i = 0; i < produceLength; i++) {
	                self.produce(barragesProduce[i], function(bullet) {
	                    produceBullets.push(bullet);
	                })
	            }
	            callback({
	                count: barragesLength,
	                bullets: bullets.concat(produceBullets)
	            });
            })
        }
    },
    //改造
    reform: function(bullet, barrage, callback) {
        var self = this;
        var dom = bullet.bulletDom;
        if (barrage.uid == self.userUid) {
            if (!dom.hasClass('h5player-barrage-item-self')) {
                dom.addClass('h5player-barrage-item-self');
            }
        } else {
            if (dom.hasClass('h5player-barrage-item-self')) {
                dom.removeClass('h5player-barrage-item-self');
            }
        }
        dom.css('display','block');
        bullet.content = barrage.content;
        callback(bullet);
    },
    reformBullets: function(bullets, barrages, callback) {
    	if(bullets.length==0){
    		 callback([]);
    	}else{
    		var self = this;
	        var bulletsArr = [];
	        for (var i = 0; i < bullets.length; i++) {
	            this.reform(bullets[i], barrages[i], function(bullet) {
	                bulletsArr.push(bullet);
	            })
	        }
	        callback(bulletsArr);
    	}
    },
    getStoreLength: function() {
        return this.store.length;
    },
    storeIsEmpty: function() {
        return this.store.length == 0 ? true : false;
    },
    //生产新的bullet并入库
    produce: function(barrage, callback) {
    	var self = this;
        switch (barrage.type) {
            case 1: //普通弹幕
                var itemselfCls = barrage.uid == this.userUid ? 'h5player-barrage-item-self' : '';
                var barrageHtml = '<div style="tmpstyle" class="h5player-barrage-item ' + itemselfCls + '"></div>';
                var bullet = {
                    bulletDom: $(barrageHtml),
                    isBusy: true,
                    content: barrage.content,
                    tunnel: -1
                };
                self.inStore(bullet);
                callback(bullet);
                break;
        }
    },
    //tunnelIndexEnd为-1则隐藏大于start的所有弹幕
    hide:function(tunnelIndexStart,tunnelIndexEnd,callback){
        if(this.store.length == 0 || (tunnelIndexEnd!=-1 && tunnelIndexEnd <=tunnelIndexStart)){
            if(callback && typeof callback == 'function'){
                callback();
            }
        }else{
            for(var i = 0,len=this.store.length;i< len;i++){
                var tunnelIndex = this.store[i].tunnel;
                if(tunnelIndex >= tunnelIndexStart){
                    if(tunnelIndexEnd==-1 || tunnelIndex < tunnelIndexEnd){
                        try{
                             this.store[i].bulletDom.css('display','none');
                        }catch(e){
                            h5playerLog('bullet hide exception, '+e, 3);
                        }
                    }
                }
            }
            if(callback && typeof callback == 'function'){
                callback();
            }
        }
    }
}