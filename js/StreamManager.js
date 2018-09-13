function StreamManager(params, callback) {
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
StreamManager.prototype.setRoomId = function (roomid) {
    this._roomId = roomid;
    this._definition = null;
    this._lineIndex = 0;        // 当前播放线路的index
    this.getPlayUrl();
}

/**
 *  获取当前播放的url数据
 * */
StreamManager.prototype.getCurrentStreamUrl = function () {
    if(this._streamData && this._lineIndex >= 0 && this._lineIndex < this._streamData.length) {
        return this._streamData[this._lineIndex].url;
    }
    return "";
}


/**
 *  切换线路
 * */
StreamManager.prototype.setStreamDefinition = function(index) {
    if(this._streamData && index >= 0 && index < this._streamData.length) {
        this._lineIndex = index;
        return true;
    }
    return false;
}

/**
 *  获取播放Url列表
 * */
StreamManager.prototype.getStreamNameList = function () {
    var arr = [];
    if(this._streamData) {
        for(var i = 0; i < this._streamData.length; ++i) {
            var obj = {};
            switch (this._streamData[i].def) {
                case "sd":
                    obj = {str:"[" + this._streamData[i].name + "]标清", def:this._streamData[i].def};
                    break;

                case "hd":
                    obj = {str:"[" + this._streamData[i].name + "]高清", def:this._streamData[i].def};
                    break;

                case "shd":
                    obj = {str:"[" + this._streamData[i].name + "]超清", def:this._streamData[i].def};
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
StreamManager.prototype.getCurrentStreamDefinition = function () {
    return this._definition;
}

/**
 *  获取视频清晰度列表
 * */
StreamManager.prototype.getCurrentStreamDefinitionIndex = function () {
    return this._lineIndex;
}

/**
 *  获取播放url
 * */
StreamManager.prototype.getPlayUrl = function () {
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
                window.console&&console.log("streammanager jsonp error:" + JSON.stringify(xhr));
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
StreamManager.prototype.parseData = function (resObj) {
    if(resObj) {
        if(0 == resObj.code && resObj.data) {
            this._streamData = [];
                for(var i = 0; i < resObj.data.length; ++i) {
                    if(resObj.data[i].shdPlayUrl) {
                        this._streamData.push({def:"shd", protocol:resObj.data[i].protocol, name:resObj.data[i].name, liveSourceId:resObj.data[i].liveSourceId, url:resObj.data[i].shdPlayUrl});
                    }
                    if(resObj.data[i].hdPlayUrl) {
                        this._streamData.push({def:"hd", protocol:resObj.data[i].protocol, name:resObj.data[i].name, liveSourceId:resObj.data[i].liveSourceId, url:resObj.data[i].hdPlayUrl});
                    }
                    if(resObj.data[i].sdPlayUrl) {
                        this._streamData.push({def:"sd", protocol:resObj.data[i].protocol, name:resObj.data[i].name, liveSourceId:resObj.data[i].liveSourceId, url:resObj.data[i].sdPlayUrl});
                    }
                }
            
            this.selectLine();
            if(this._callback) {
                this._callback();
            }
        } else if(405 == resObj.code) {     // 主播下线

        } else {    // 没有开播

        }

    } else {
        console.log("streammanager parsedata error");
    }
}

StreamManager.prototype.selectLine = function () {
    if(!this._definition) {
        for(var i = 0; i < this._streamData.length; ++i) {
            if(this._streamProtocol == this._streamData[i].protocol) {
                if(this._streamData[i].liveSourceId != 1)
                {
                    this._lineIndex = i;
                    break;
                }
            }
        }
    }
}

StreamManager.prototype.clear = function () {
    this._streamData = [];
}