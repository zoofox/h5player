/*
系统消息 喇叭
 */
function h5playerSystemMessage(queue, callback) {
    this.queue = queue;
    this.SINGLE_TEXT_WIDTH = 7;
    this.systemMessageSpeed = queue.systemMessageSpeed;
    this.systemMessageRunning = false;
    this.buffer = [];
    this.init(callback);
}
h5playerSystemMessage.prototype = {
    init: function(callback) {
        callback(this);
    },
    handOver: function(msg) {
        if (this.systemMessageRunning) {
            this.buffer.push(msg);
        } else {
            this.prepare(msg);
        }
    },
    prepare: function(msg) {
        this.systemMessageRunning = true;
        var videoWidth = $('#live-h5player-container').width();
        var textWidth = Math.floor(this.queue.barrage.getBarrageContentLen(msg.pureStr) * this.SINGLE_TEXT_WIDTH);
        var middleBarWidth = textWidth - 28 - 10; //左28 右10
        var contentWidth = textWidth;
        $('#system-message .middle-bar').css({
            'width': middleBarWidth,
            'background-size': middleBarWidth + 'px 24px'
        });
        $('#system-message .message-content').html(msg.str).css('width', textWidth + 'px');
        var systemMessageWidth = $('#system-message').width();
        var allWidth = videoWidth + systemMessageWidth;
        $('#system-message').css({
            'display': 'block',
            'width': systemMessageWidth + 'px',
            'left': videoWidth + 'px',
            'transform': 'translateX(0)'
        });
        var time = (allWidth / this.systemMessageSpeed).toFixed(2);
        this.run(allWidth, time);
    },
    run: function(allWidth, time) {
        var self = this;
        setTimeout(function() {
            $('#system-message').css({
                'transform': 'translateX(-' + allWidth + 'px)',
                'transition': 'transform ' + time + 's linear 0s'
            })
        }, 50)
        setTimeout(function() {
            $('#system-message').css({
                'transition': 'none'
            })
            self.systemMessageRunning = false;
            if (self.buffer.length != 0) {
                var msg = self.buffer.shift();
                self.prepare(msg);
            }
        }, time * 1000)
    }
};