/*
h5播放器弹幕弹道
 */
function h5playerBarrageTunnelManager(params, callback) {
    this.videoId = params.videoId;
    this.singleTunnelHeight = params.singleTunnelHeight; //弹幕轨道高度
    this.barragePosition = params.barragePosition;
    this.tunnelCount = 0;
    this.BARRAGE_POSITION_NOTFULL_SCREEN = 0.3; //弹幕非全屏时显示比例
    this.callback = callback;
    this.tunnels = [];
    this.init();
}

h5playerBarrageTunnelManager.prototype = {
    init: function() {
    	this.initTunnels();
        if (this.callback) {
            this.callback(this);
        }
    },
    //window resize需要重新init?
    initTunnels: function(callback) {
        var videoIdHeight = $('#live-h5player-container').height();
        console.log(videoIdHeight)
        this.tunnelCount = Math.floor(videoIdHeight / this.singleTunnelHeight);
        var tunnelSign = Date.now();
        for (var i = 0; i < this.tunnelCount; i++) {
            this.tunnels.push({
                index: i,
                sign: tunnelSign, //每次生成tunnel都有新的sign 用以区别不同阶段tunnel 防止误操作
                ready: true, //是否可用
                lastDuration: 0, //上一条弹幕走完全屏时长
                lastTimeStamp: 0, //上一条弹幕出发的时间戳
            })
        }
        if(callback&&typeof callback == 'function'){
        	callback();
        }
    },
    calculateTunnelCount: function(position, callback) {
        var videoIdHeight = $('#live-h5player-container').height();
        console.log(videoIdHeight);
        var tunnelHeight = videoIdHeight;
        var currentTunnelsLength = this.tunnels.length;
        //position 0全屏 1顶端 2底端
        if (position != 0) {
            tunnelHeight = tunnelHeight * this.BARRAGE_POSITION_NOTFULL_SCREEN;
        }
        this.tunnelActiveCount = Math.floor(tunnelHeight / this.singleTunnelHeight);
        h5playerLog('tunnel active count ' + this.tunnelActiveCount, 1);
        if (position == 2) {
            this.tunnelBlankHeight = videoIdHeight - currentTunnelsLength * this.singleTunnelHeight; //用于计算底部弹幕上方空白距离
        } else {
            this.tunnelBlankHeight = 0;
        }
        if (this.tunnelActiveCount <= currentTunnelsLength) {
        	if(position == 2){
        		var activeIndex = currentTunnelsLength - this.tunnelActiveCount;
        		this.activeTunnels = this.tunnels.slice(activeIndex);
        	}else{
        		this.activeTunnels = this.tunnels.slice(0, this.tunnelActiveCount);
        	}
        } else{
            var newTunnelsCount = this.tunnelActiveCount - currentTunnelsLength;
            var tunnelSign = Date.now();
            for (var i = 0; i < newTunnelsCount; i++) {
                this.tunnels.push({
                    index: i + currentTunnelsLength,
                    sign: tunnelSign, //每次生成tunnel都有新的sign 用以区别不同阶段tunnel 防止误操作
                    ready: true, //是否可用
                    lastDuration: 0, //上一条弹幕走完全屏时长
                    lastTimeStamp: 0, //上一条弹幕出发的时间戳
                })
            }
            this.activeTunnels = this.tunnels;
        }
        if ('function' == typeof callback) {
            callback();
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
                if (sign == this.tunnels[0].sign) {
                    this.tunnels[index].ready = status;
                }
            }
        } catch (e) {
            h5playerLog(e,3);
        }


    }
}