/*
礼物连击动画
 */
function h5playerGiftcomboAnimation(queue, callback) {
    this.queue = queue;
    this.SINGLE_TEXT_WIDTH = 7;
    this.giftcomboAnimationSpeed = queue.giftcomboAnimationSpeed;
    this.comboAnimationRunning = false;
    this.buffer = [];
    this.init(callback);
}
h5playerGiftcomboAnimation.prototype = {
    init: function(callback) {
        callback(this);
    },
    getConfig: function() {
        //默认图，cancas画图出现异常时使用
        return {
            "barImgs": {
                "textBarImg0": '../imgs/h5player/combo/1/bar0.png',
                "textBarImg1": '../imgs/h5player/combo/1/bar1.png',
                "textBarImg2": '../imgs/h5player/combo/1/bar2.png'
            }
        }
    },
    handOver: function(params) {
        if (this.comboAnimationRunning) {
            this.buffer.push(params);
        } else {
            this.prepare(params);
        }
    },
    prepare: function(params, callback) {
        var self = this;
        this.comboAnimationRunning = true;
        var videoWidth = $('#live-h5player-container').width();
        var textWidth = Math.floor(this.queue.barrage.getBarrageContentLen(params.combotext.pureStr) * this.SINGLE_TEXT_WIDTH);
        var middleBarWidth = textWidth - 30 - 20; //20（leftbar）30 (rightbar)
        textWidth -= 20;
        $('#giftcombo-animation .giftcombo-img').attr('src', params.icon);

        $('#giftcombo-animation .middle-bar').css('width', middleBarWidth + 'px');
        $('#giftcombo-animation .giftcombo-text').html(params.combotext.str).css('width', textWidth + 'px');
        var comboleft = videoWidth + 30;
        var comboWidth = textWidth + 30 + 20 + 30;
        $('#giftcombo-animation').css({
            'display': 'block',
            'width': comboWidth + 'px',
            'left': comboleft + 'px',
            'transform': 'translateX(0)'
        });
        var allWidth = $('#giftcombo-animation').width() + comboleft;
        var time = (allWidth / this.giftcomboAnimationSpeed).toFixed(2);
        var bgUrl = params.bgUrl;
        this.setImg(bgUrl, middleBarWidth, function() {
            self.run(allWidth, time);
        });
    },
    setImg: function(bgUrl, middleBarWidth, callback) {
        try {
            var canvas = document.getElementById('left-bar');
            var canvas2 = document.getElementById('right-bar');
            var canvas3 = document.getElementById('middle-bar');
            canvas3.width = middleBarWidth;
            var ctx = canvas.getContext('2d');
            var ctx2 = canvas2.getContext('2d');
            var ctx3 = canvas3.getContext('2d');
            var img = new Image();
            img.src = bgUrl;
            img.onload = function() {
                ctx.drawImage(img, 0, 0, 100, 56, 0, 0, 50, 28);
                ctx2.drawImage(img, 110, 0, 100, 56, 0, 0, 50, 28);
                ctx3.drawImage(img, 100, 0, 10, 56, 0, 0, middleBarWidth, 28);
                callback();
            }
        } catch (e) {
            window.console && console.log('canvas set image exception ' + e);
            var config = this.getConfig();
            $('#giftcombo-animation .left-bar').css({
                'background': 'url(' + config.barImgs.textBarImg0 + ') no-repeat',
                'backgroundSize': '50px 28px'
            })
            $('#giftcombo-animation .middle-bar').css({
                'background': 'url(' + config.barImgs.textBarImg1 + ') repeat',
                'backgroundSize': middleBarWidth + 'px 28px'
            })
            $('#giftcombo-animation .right-bar').css({
                'background': 'url(' + config.barImgs.textBarImg2 + ') no-repeat',
                'background-size': '50px 28px'
            })
            callback();
        }
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
            if (self.buffer.length != 0) {
                var params = self.buffer.shift();
                self.prepare(params);
            }
        }, time * 1000)
    }
};