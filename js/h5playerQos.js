function h5playerQos(roomid, playerType) {
    this._roomId = roomid;
    this._playerType = playerType;
    this._url = "https://stat.chushou.tv/h5/qos/live.htm";
    this._id = String(new Date().getTime()) + String(Math.random());
    this._system = this.getSystemName();
    this._browser = this.getBrowserName();
}
h5playerQos.prototype = {
    destroy: function() {
        this.stopTimer();
    },
    /**
     *  设置流名称
     * */
    setStreamName: function(streamUrl) {
        if (streamUrl && streamUrl.length > 5) {
            var index = streamUrl.lastIndexOf("?");
            this._streamName = streamUrl;
            if (index != -1) {
                this._streamName = streamUrl.substring(0, index);
            }
            index = this._streamName.lastIndexOf("/");
            if (index != -1) {
                this._streamName = this._streamName.substring(index + 1, this._streamName.length);
            }
            this.reset();
        }
    },
    /**
     *  播放成功
     * */
    PlaySuccess: function() {
        this.stopTimer();
        this.send(2);
    },

    reset: function() {
        this.stopTimer();
        this.send(0);
        this._timerId = setInterval(function(self) {
            self.send(1);
        }, 10000, this);
    },

    /**
     *  发送Qos请求
     *  @param      state       播放状态    0:开始    1:未成功   2:成功
     * */
    send: function(state) {
        if (!this._jsonpReq) {
            this._jsonpReq = new JsonpUtil();
        }
        this._jsonpReq.Request({
            url: this._url,
            callback: 'callback',
            time: 2000,
            data: {
                uid: this._id,
                system: this._system,
                browser: this._browser,
                state: state,
                stream: this._streamName,
                roomid: this._roomId,
                playerType: this._playerType
            }
        });
    },

    /**
     *  停止计时器
     * */
    stopTimer: function() {
        if (this._timerId != null) {
            clearInterval(this._timerId);
            this._timerId = null;
        }
    },
    getSystemName:function(){
        if(navigator.userAgent.indexOf("Windows", 0) != -1){
            return 'windows';
        }
        if(navigator.userAgent.indexOf("Mac OS", 0) != -1){
            return 'mac';
        }
        if(navigator.userAgent.indexOf("Linux", 0) != -1){
            return 'linux'
        }
        return '';
    },
    getBrowserName:function(){
        //IE浏览器
        var ua = navigator.userAgent.toLowerCase();
        if((/msie\s([\d.]+)/).test(ua)){
            return "ie";
        }
        //chrome浏览器
        if((/chrome\/([\d.]+)/).test(ua)){
            return "chrome";
        }
        //firefox浏览器
        if((/firefox\/([\d.]+)/).test(ua)){
            return "firefox";
        }
        //opera浏览器
        if((/opera\/.*version\/([\d.]+)/).test(ua)){
            return "opera";
        }
        //safari浏览器
        if((/version\/([\d.]+).*safari/).test(ua)){
            return "safari";
        }
        return '';
    }

}