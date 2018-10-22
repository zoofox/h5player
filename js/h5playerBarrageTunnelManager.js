/*
h5播放器弹幕弹道
 */
function H5playerBarrageTunnelManager(params, callback) {
    this.videoId = params.videoId;
    this.singleTunnelHeight = params.singleTunnelHeight; //弹幕轨道高度
    this.barragePosition = params.barragePosition;
    this.tunnelCount = 0;
    this.BARRAGE_POSITION_NOTFULL_SCREEN = 0.3; //弹幕非全屏时显示比例
    this.callback = callback;
    this.tunnels = [];
    this.calculating = false; //正在calculate..
    this.calculateTimeStamp = 0;
    this.init();
}

H5playerBarrageTunnelManager.prototype = {
    init: function() {
        this.initTunnels();
        if (this.callback) {
            this.callback(this);
        }
    },
    //window resize需要重新init?
    initTunnels: function(callback) {
        var videoIdHeight = $('#live-h5player-container').height();
        this.tunnelCount = Math.floor(videoIdHeight / this.singleTunnelHeight);
        var tunnelSign = Date.now();
        for (var i = 0; i < this.tunnelCount; i++) {
            this.tunnels.push({
                index: i,
                sign: tunnelSign, //每次生成tunnel都有新的sign 用以区别不同阶段tunnel 防止误操作
                ready: true, //是否可用
                lastDuration: 0, //上一条弹幕走完全屏时长
                lastTimeStamp: 0 //上一条弹幕出发的时间戳
            })
        }
        if (callback && typeof callback == 'function') {
            callback();
        }
    },
    calculateTunnelCount: function(position, callback) {
        if (!this.calculating) {
            this.calculating = true;
            this.calculateTimeStamp = Date.now();
            var videoIdHeight = $('#live-h5player-container').height();
            var tunnelHeight = videoIdHeight;
            var currentTunnelsLength = this.tunnels.length;
            //position 0全屏 1顶端 2底端
            if (position != 0) {
                tunnelHeight = tunnelHeight * this.BARRAGE_POSITION_NOTFULL_SCREEN;
            }
            this.lastActiveCount = this.tunnelActiveCount;
            this.tunnelActiveCount = Math.floor(tunnelHeight / this.singleTunnelHeight);

            var currentTotalTunnelsCount = Math.floor(videoIdHeight / this.singleTunnelHeight);
            //高度发生了变化
            if (currentTotalTunnelsCount > currentTunnelsLength) {
                var newCount = currentTotalTunnelsCount - currentTunnelsLength;
                var tunnelSign = Date.now();
                for (var i = 0; i < newCount; i++) {
                    this.tunnels.push({
                        index: i + currentTunnelsLength,
                        sign: tunnelSign, //每次生成tunnel都有新的sign 用以区别不同阶段tunnel 防止误操作
                        ready: true, //是否可用
                        lastDuration: 0, //上一条弹幕走完全屏时长
                        lastTimeStamp: 0 //上一条弹幕出发的时间戳
                    })
                }
            }
            h5playerLog('tunnel active count ' + this.tunnelActiveCount, 1);
            if (position == 2) {
            	var allHeight = this.tunnels.length * this.singleTunnelHeight;
            	if(videoIdHeight > allHeight){
	                this.tunnelBlankHeight = videoIdHeight - this.tunnels.length * this.singleTunnelHeight; //用于计算底部弹幕上方空白距离
            	}else{
            		this.tunnelBlankHeight = videoIdHeight - currentTotalTunnelsCount * this.singleTunnelHeight;
            	}
            	var activeIndex = Math.ceil((videoIdHeight - tunnelHeight) / this.singleTunnelHeight);
                this.activeTunnels = this.tunnels.slice(activeIndex, this.tunnelActiveCount + activeIndex);
            } else {
                this.tunnelBlankHeight = 0;
                this.activeTunnels = this.tunnels.slice(0, this.tunnelActiveCount);
            }
            this.calculating = false;
            if ('function' == typeof callback) {
                callback(this.activeTunnels, this.tunnelActiveCount, this.lastActiveCount);
            }
        } else {
            //丢掉1秒内的多次重计算请求，大于1秒则0.5秒后再次发起，大于3秒则重置calculating状态直接再次请求防止上一次阻塞
            var now = Date.now();
            var timeGap = now - this.calculateTimeStamp;
            if (timeGap > 1000) {
                var self = this;
                if (timeGap > 3000) {
                    this.calculating = false;
                    this.calculateTunnelCount(position, callback);
                } else {
                    setTimeout(function() {
                        self.calculateTunnelCount(position, callback);
                    }, 500);
                }

            } else {
                if ('function' == typeof callback) {
                    callback();
                }
            }
        }
    },
    tunnelPositionChange: function(position, callback) {
        this.calculateTunnelCount(position, function() {
            callback();
        })
    },
    getTunnelReady: function(callback) {
        var readyTunnels = this.activeTunnels.filter(function(tunnel) {
            return tunnel && tunnel.ready;
        })
        callback({
            count: readyTunnels.length,
            tunnels: readyTunnels
        });
    },
    setTunnelStatus: function(index, sign, status) {
        try {
            if (this.tunnels.length > index) {
                if (sign == this.tunnels[index].sign) {
                    this.tunnels[index].ready = status;
                }
            }
        } catch (e) {
            h5playerLog(e, 3);
        }


    }
}