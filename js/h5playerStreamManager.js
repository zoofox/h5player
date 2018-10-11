function h5playerStreamManager(params, callback) {
    this._roomId = params.roomId;
    this._host = params.host;
    this._callback = callback;
    this._lineIndex = 0;        // 当前播放线路的index

    this._isAutoSelectLine = true;  // 第一次自动选择线路
    this._streamProtocol = 2;

    if(!this._host) {
        this._host = "https://chushou.tv";
    }
    this.getPlayUrl();
}

/**
 *  切换房间
 * */
h5playerStreamManager.prototype.setRoomId = function (roomid) {
    this._roomId = roomid;
    this._definition = null;
    this._lineIndex = 0;        // 当前播放线路的index
    this.getPlayUrl();
}

/**
 *  获取当前播放的url数据
 * */
h5playerStreamManager.prototype.getCurrentStreamUrl = function () {
    if(this.streamData && this._lineIndex >= 0 && this._lineIndex < this.streamData.length) {
        return this.streamData[this._lineIndex].url;
    }
    return "";
}


/**
 *  切换线路
 * */
h5playerStreamManager.prototype.setStreamDefinition = function(index) {
    if(this.streamData && index >= 0 && index < this.streamData.length) {
        this._lineIndex = index;
        return true;
    }
    return false;
}

/**
 *  获取播放Url列表
 * */
h5playerStreamManager.prototype.getStreamNameList = function () {
    var arr = [];
    if(this.streamData) {
        for(var i = 0; i < this.streamData.length; ++i) {
            var obj = {};
            switch (this.streamData[i].def) {
                case "sd":
                    obj = {str:"[" + this.streamData[i].name + "]标清", def:this.streamData[i].def};
                    break;

                case "hd":
                    obj = {str:"[" + this.streamData[i].name + "]高清", def:this.streamData[i].def};
                    break;

                case "shd":
                    obj = {str:"[" + this.streamData[i].name + "]超清", def:this.streamData[i].def};
                    break;

                default:
                    break;
            }
            if(obj) {
                arr.push(obj);
            }
        }
    }
    return arr;
}

/**
 *  获取当前播放url的清晰度
 * */
h5playerStreamManager.prototype.getCurrentStreamDefinition = function () {
    return this._definition;
}

/**
 *  获取视频清晰度列表
 * */
h5playerStreamManager.prototype.getCurrentStreamDefinitionIndex = function () {
    return this._lineIndex;
}

/**
 *  获取播放url
 * */
h5playerStreamManager.prototype.getPlayUrl = function () {
    if(this._roomId) {
        var self = this;
        var opts = {
            url:this._host + "/h5player/video/get-play-url.htm?roomId="+this._roomId+'&protocols=2',
            type:'get',
            cache:false,
            dataType:'jsonp',
            success:function(res) {
                self.parseData(res);
            },
            error:function(xhr) {
                window.console&&console.log("h5playerstreammanager jsonp error:" + JSON.stringify(xhr));
            }
        };
        $.ajax(opts);
    } else {
        console.log("roomId error");//没有直播
        return false;
    }
}

/**
 *  解析播放url
 * */
h5playerStreamManager.prototype.parseData = function (resObj) {
    if(resObj) {
        if(0 == resObj.code && resObj.data) {
            this.streamData = [];
                for(var i = 0; i < resObj.data.length; ++i) {
                    if(resObj.data[i].shdPlayUrl) {
                        this.streamData.push({def:"shd", protocol:resObj.data[i].protocol, name:resObj.data[i].name, liveSourceId:resObj.data[i].liveSourceId, url:resObj.data[i].shdPlayUrl});
                    }
                    if(resObj.data[i].hdPlayUrl) {
                        this.streamData.push({def:"hd", protocol:resObj.data[i].protocol, name:resObj.data[i].name, liveSourceId:resObj.data[i].liveSourceId, url:resObj.data[i].hdPlayUrl});
                    }
                    if(resObj.data[i].sdPlayUrl) {
                        this.streamData.push({def:"sd", protocol:resObj.data[i].protocol, name:resObj.data[i].name, liveSourceId:resObj.data[i].liveSourceId, url:resObj.data[i].sdPlayUrl});
                    }
                }
            this.selectLine();
            if(this._callback) {
                this._callback();
            }
        } else if(405 == resObj.code) {     // 主播下线
            alert('已下播')
        } else {    // 没有开播
             alert('未开播')
        }

    } else {
        console.log("h5playerstreammanager parsedata error");
    }
}

h5playerStreamManager.prototype.selectLine = function () {
    if(!this._definition) {
        for(var i = 0; i < this.streamData.length; ++i) {
            if(this._streamProtocol == this.streamData[i].protocol) {
                if(this.streamData[i].liveSourceId != 1)
                {
                    this._lineIndex = i;
                    break;
                }
            }
        }
    }
}

h5playerStreamManager.prototype.clear = function () {
    this.streamData = [];
}