/*
礼物连击动画
 */
function h5playerGiftcomboAnimation(queue, callback) {
    this.queue = queue;
    this.SINGLE_TEXT_WIDTH = 7;
    this.barrageFlySpeed = queue.barrageFlySpeed;
    this.comboAnimationRunning = false;
    this.buffer = [];
    this.init(callback);
}
h5playerGiftcomboAnimation.prototype = {
    init: function(callback) {
        this.config();
        callback(this);
    },
    config: function() {
        this.configJson = {
            0: {
                "value": 23,
                "barImgs": {
                    "textBarImg0": '../imgs/h5player/combo/0/bar0.png',
                    "textBarImg1": '../imgs/h5player/combo/0/bar1.png',
                    "textBarImg2": '../imgs/h5player/combo/0/bar2.png'
                },
                "giftImg": '../imgs/h5player/combo/0/gift.gif'
            },
            1: {
                "value": 666,
                "barImgs": {
                    "textBarImg0": '../imgs/h5player/combo/1/bar0.png',
                    "textBarImg1": '../imgs/h5player/combo/1/bar1.png',
                    "textBarImg2": '../imgs/h5player/combo/1/bar2.png'
                },
                "giftImg": '../imgs/h5player/combo/1/gift.gif'
            }
        }
    },
    getConfig: function(giftId) {
        var config = this.configJson[giftId];
        if (config) {
            if (!config.barImgs) {
                if (config.value < 100) {
                    config.barImgs = this.configJson[0].barImgs;
                } else {
                    config.barImgs = this.configJson[1].barImgs;
                }
            }
        } else {
            return this.configJson[1];
        }

        return config;
    },
    handOver: function(params) {
        if (this.comboAnimationRunning) {
        	this.buffer.push(params);
        } else {
            this.prepare(params);
        }
    },
    prepare: function(params, callback) {
    	this.comboAnimationRunning = true;
        var videoWidth = $('#live-h5player-container').width();
        var config = this.getConfig(params.giftId);
        var textWidth = Math.floor(this.queue.barrage.getBarrageContentLen(params.combotext.pureStr) * this.SINGLE_TEXT_WIDTH);
        var middleBarWidth = textWidth - 30 - 20; //20（leftbar）30 (rightbar)
        textWidth -= 20;
        $('#giftcombo-animation .giftcombo-img').attr('src', params.icon);
        $('#giftcombo-animation .left-bar').css({
        	'background':'url('+config.barImgs.textBarImg0+') no-repeat',
        	'backgroundSize':'50px 28px'
        })
        $('#giftcombo-animation .middle-bar').css({
        	'background':'url('+config.barImgs.textBarImg1+') repeat',
        	'backgroundSize':middleBarWidth+'px 28px'
        })
        $('#giftcombo-animation .right-bar').css({
        	'background':'url('+config.barImgs.textBarImg2+') no-repeat',
        	'background-size':'50px 28px'
        })
        $('#giftcombo-animation .middle-bar').css('width', middleBarWidth + 'px');
        $('#giftcombo-animation .giftcombo-text').html(params.combotext.str).css('width', textWidth + 'px');
        var comboleft = videoWidth + 30;
        var comboWidth = textWidth + 30 + 20 + 30;
        $('#giftcombo-animation').css({
        	'display':'block',
            'width': comboWidth + 'px',
            'left': comboleft + 'px',
            'transform': 'translateX(0)'
        });
        var allWidth = $('#giftcombo-animation').width() + comboleft;
        var time = (allWidth / 100).toFixed(2);
        this.run(allWidth, time);
    },
    run: function(allWidth, time) {
        var self = this;
        setTimeout(function() {
            $('#giftcombo-animation').css({
                'transform': 'translateX(-' + allWidth + 'px)',
                'transition': 'transform ' + time + 's linear 0s'
            })
        }, 50)
        setTimeout(function() {
            $('#giftcombo-animation').css({
                'transition': 'none'
            })
            self.comboAnimationRunning = false;
            if(self.buffer.length!=0){
            	var params = self.buffer.shift();
            	self.prepare(params);
            }
        }, time * 1000)
    }
};