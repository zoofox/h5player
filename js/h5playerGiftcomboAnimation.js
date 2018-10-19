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
        var url = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1539948844447&di=fa0c19a388b15cb9bba05f48b6644a77&imgtype=0&src=http%3A%2F%2Fimage3.uuu9.com%2Fwar3%2Fwar3rpg%2FUploadFiles_1951%2F201107%2F201107010232336871.jpg'
        // this.clipImage(url,0,0,100,50);
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
            if (self.buffer.length != 0) {
                var params = self.buffer.shift();
                self.prepare(params);
            }
        }, time * 1000)
    },
    clipImage: function(imgUrl, x, y, w, h) {
        var canvas = document.getElementById('giftcombo-canvas');
        var ctx = canvas.getContext('2d');
        var preview = new Image();
        preview.src = imgUrl;
        canvas.width = preview.width;
        canvas.height = preview.height;
        ctx.drawImage(preview, 0, 0);
        var imgData = ctx.getImageData(x, y, w - x, h - y); //把裁剪区域的图片信息提取出来
        canvas.width = Math.abs(w - x); //重置canvas的大小为新图的大小
        canvas.height = Math.abs(h - y);
        ctx.putImageData(imgData, 0, 0); //把提取出来的图片信息放进canvas中
        console.log(canvas.toDataURL()); //裁剪后我们用新图替换底图，方便继续处理
    },
    getBase64Image: function(imgUrl, width, height) {
        var canvas = document.getElementById("giftcombo-canvas");
        var ctx = canvas.getContext('2d');
        var preview = new Image();
        preview.crossOrigin = "Anonymous";
        preview.src = imgUrl;
        canvas.width = preview.width;
        canvas.height = preview.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);
        var dataURL = canvas.toDataURL('image/png');
        var img = new Image();
        img.src = dataURL;
        return img;
    }
};