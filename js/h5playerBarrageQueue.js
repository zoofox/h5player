/**
 * 直播弹幕队列
 * 分发处理弹幕消息（普通弹幕，连击动画，喇叭）
 */
function H5playerBarrageQueue(params, callback) {
    this.buffer = [];
    this.barrage = params.barrage;
    this.barrageFlySpeed = params.barrageFlySpeed;
    this.systemMessageSpeed = params.systemMessageSpeed;
    this.giftcomboAnimationSpeed = params.giftcomboAnimationSpeed;
    this.comboBuffer = [];
    this.barrageStatus = 1; //0关闭 1开启
    this.animationStatus = 1; //飘屏和喇叭显示
    this.init(callback);
}
H5playerBarrageQueue.prototype = {
    init: function(callback) {
        this.initScreenAnimation();
        this.fatedata();
        callback(this);
    },
    initScreenAnimation: function() {
        this.screenAnimation = new ScreenAnimation({
            systemMessage: true,
            giftCombo: true,
            parent:$('#live-h5player-container')
        }, function(err) {
            if (err) {
                h5playerLog(err,3);
            }
        })
    },
    isEmpty: function() {
        return this.buffer.length == 0 ? true : false;
    },
    clearBuffer: function() {
        this.buffer = [];
    },
    getBufferLen: function() {
        return this.buffer.length;
    },
    inQueue: function(barrages) {
        this.buffer.push(barrages);
    },
    outQueue: function(length) {
        var bufferLength = this.getBufferLen();
        if (length <= bufferLength) {
            this.buffer.splice(0, length);
        } else {
            this.buffer = [];
            h5playerLog('barrage buffer length less than delete length!', 3);
        }
    },
    setBarrageStatus: function(status) {
        this.barrageStatus = status;
        this.buffer = [];
        return this;
    },
    setAnimationStatus: function(status) {
        this.animationStatus = status;
        return this;
    },
    clearAnimationBuffer: function() {
        this.setAnimationStatus(0);
        this.screenAnimation.clearBuffer(2);
        return this;
    },
    //1聊天 2喇叭/连击动画 3礼物 4进场关注铁粉等系统消息
    receiveMessages: function(messages) {
        var messagesLength = messages.length;
        if (messagesLength != 0) {
            var animationMessages = [];
            var tempBuffer = [];
            for (var i = 0; i < messagesLength; i++) {
                var type = messages[i].type;
                switch (type) {
                    case 1:
                        if (this.barrageStatus == 1) {
                            var barrageContent = this.takeOffContentShell(messages[i].content);
                            var transContent = this.translateEmoji(barrageContent);
                            tempBuffer.push({
                                content: transContent,
                                uid: messages[i].user.uid,
                                type: type
                            });
                        }
                        break;
                    default:
                        if (this.animationStatus == 1) {
                            animationMessages.push(messages[i]);
                        }
                }
            }
            this.buffer = this.buffer.concat(tempBuffer);
            animationMessages.length != 0 && this.screenAnimation.parseMessages(animationMessages);
        }
    },
    takeOffContentShell: function(content) {
        if (content.indexOf('<![JSON[') == 0 && content.indexOf(']]>' > -1)) {
            return JSON.parse(content.slice(8, -3));
        };
        return {
            content: content,
            fontColor: ''
        };
    },
    //contentFate用于计算弹幕长度 替换contentFate中表情为CS，用以减小弹幕长度
    translateEmoji: function(content) {
        var contentStr = content.content;
        if (contentStr.indexOf("[") != -1 && contentStr.indexOf("]") != -1) {
            content.content = CSEmoji.trans(contentStr);
            content.contentFate = this.replaceEmojiText(contentStr);
        } else {
            content.contentFate = contentStr;
        }
        return content;
    },
    replaceEmojiText: function(str) {
        var emojistr = str.match(/\[(\S*)\]/);
        var reg = /\d_\S*/;
        try {
            if (reg.test(emojistr[0])) {
                return str.replace(emojistr[0], 'CS');
            }
        } catch (e) {
            return str;
        }
        return str;
    },
    fatedata: function() {
        if (typeof H5playerFateData == 'object') {
            var self = this;
            setInterval(function() {
                if (self.buffer.length < 100) {
                    var m = H5playerFateData.fate();
                    self.receiveMessages(m);
                }
            }, 500)
        }
    }
}