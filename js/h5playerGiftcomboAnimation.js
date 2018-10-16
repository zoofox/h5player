/*
礼物连击动画
 */
function h5playerGiftcomboAnimation(callback){
	this.init(callback);
}
h5playerGiftcomboAnimation.prototype = {
	init:function(callback){
		this.config();
		callback(this);
	},
	config:function(){
		this.configJson = {
			0:{
				"value":23,
				"barImgs":[
					"textBarImg0":'../imgs/h5player/combo/0/bar0.png',
					"textBarImg1":'../imgs/h5player/combo/0/bar1.png',
					"textBarImg2":'../imgs/h5player/combo/0/bar2.png'
				],
				"giftImg":'../imgs/h5player/combo/0/gift.gif'
			}
		}
	},
	getConfig:function(giftId){
		var config = this.configJson[giftId];
		if(!config.barImgs){
			if(config.value < 100){
				config.barImgs = this.configJson[0].barImgs;
			}else{
				config.barImgs = this.configJson[1].barImgs;
			}
		}
		return config;
	},
	runAnimate:function(){

	}
};