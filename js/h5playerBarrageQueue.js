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
    this.animationStatus = 1;//飘屏和喇叭显示
    this.init(callback);
}
H5playerBarrageQueue.prototype = {
    init: function(callback) {
        this.initSystemMessage();
        this.initGiftcomboAnimation();
        this.fatedata();
        callback(this);
    },
    initGiftcomboAnimation: function() {
        var self = this;
        new H5playerGiftcomboAnimation(this, function(giftCombo) {
            self.giftCombo = giftCombo;
        });
    },
    initSystemMessage: function() {
        var self = this;
        new H5playerSystemMessage(this, function(systemMessage) {
            self.systemMessage = systemMessage;
        });
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
    setBarrageStatus:function(status){
    	this.barrageStatus = status;
    	this.buffer = [];
    	return this;
    },
    setAnimationStatus:function(status){
    	this.animationStatus = status;
    	return this;
    },
    clearAnimationBuffer:function(){
    	this.setAnimationStatus(0);
    	this.giftCombo.clearBuffer();
    	this.systemMessage.clearBuffer();
    	return this;
    },
    //1聊天 2喇叭/连击动画 3礼物 4进场关注等系统消息
    receiveMessages: function(messages) {
        var messagesLength = messages.length;
        var tempBuffer = [];
        for (var i = 0; i < messagesLength; i++) {
            var type = messages[i].type;
            switch (type) {
                case 1:
                	if(this.barrageStatus == 1){
                		var barrageContent = this.takeOffContentShell(messages[i].content);
	                    var transContent = this.translateEmoji(barrageContent);
	                    tempBuffer.push({
	                        content: transContent,
	                        uid: messages[i].uid,
	                        type: type
	                    });
                	}
                    break;
                case 2:
                	if(this.animationStatus == 1){
                		 if (messages[i].metaInfo && messages[i].metaInfo.animation == 5) {
	                        //连击动画
	                        this.comboAnimation(messages[i].metaInfo);
	                    } else {
	                        //喇叭
	                        this.systemMsg(messages[i].content);
	                    }
                	}
                    break;
                case 3:
                    break;
                case 4:
                    break;
            }
        }
        this.buffer = this.buffer.concat(tempBuffer);

    },
    updateLiveTime: function(liveTime) {
        var str = '';
        var sec = Math.floor(liveTime / 1000);
        if (liveTime < 1000) {
            str = '刚刚开播';
        } else if (liveTime > 1000 && liveTime < 60 * 60 * 1000) {
            var min = Math.floor(sec / 60);
            str = ' 已开播：' + min + '分钟';
        } else {
            var hour = Math.floor(sec / 3600);
            var min = Math.floor((sec - hour * 3600) / 60);
            var str = '已开播时间：' + hour + '小时' + min + '分钟';
            $('.live-time-now').text('已开播时间：' + hour + '小时' + min + '分钟');
        }
        $('.live-time-now').text(str);
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
    //连击动画
    comboAnimation: function(metaInfo) {
        if (this.giftCombo) {
            var animationIcon = metaInfo.animationIcon;
            var giftId = animationIcon.match(/v4\/(\S*)_/)[1];
            var combotext = this.reformContent(metaInfo.animationText);
            this.giftCombo.handOver({
                combotext: combotext,
                icon: animationIcon,
                bgUrl: metaInfo.animationBg
            }); //queue只负责分发，不负责具体动画业务
        }
    },
    //喇叭
    systemMsg: function(content) {
        if (this.systemMessage) {
            var msg = this.reformContent(content);
            this.systemMessage.handOver(msg);
        }
    },
    //处理连击动画和喇叭的文案
    reformContent: function(text) {
        var contentArr = text.match(/\<\!\[JSON\[(.*?)\]\]\>/g); //拆分
        var str = '';
        var pureStr = '';
        for (var i = 0, len = contentArr.length; i < len; i++) {
            var contentJSON = this.takeOffContentShell(contentArr[i]); //脱壳
            //1文字 2图片
            if (contentJSON.type == 1) {
                str += '<span style="color:' + contentJSON.fontColor + '">' + contentJSON.content + '</span>';
                pureStr += contentJSON.content;
            } else {
                str += '<img src="' + contentJSON.image + '">';
                pureStr += '[图]';
            }
        }
        return {
            str: str,
            pureStr: pureStr
        };
    },
    fatedata: function() {
        var a = [
            { "metaInfo": { "additionType": 2, "animation": 5, "animationBg": "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png", "animationIcon": "https://kascdn.kascend.com/jellyfish/gift/v4/225_animation.gif", "animationPriority": 20, "animationSwfName": "WishCrystalGift", "animationText": '<![JSON[{"fontSizeLevel":4,"type":1,"content":" 清の酒 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 包子包子包肉肉 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"许愿水晶 30连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#ffffff"}]]>' }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 2, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "additionType": 2, "animation": 5, "animationBg": "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png", "animationIcon": "https://kascdn.kascend.com/jellyfish/gift/v4/5_animation.gif", "animationPriority": 20, "animationSwfName": "WishCrystalGift", "animationText": '<![JSON[{"fontSizeLevel":4,"type":1,"content":" 清の酒 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 包子包子包肉肉 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"许愿水晶 30连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"强无敌","fontColor":"#ffffff"}]]>' }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 2, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "additionType": 2 }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 2, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": '<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"type":1,"content":"主播 ","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":"聪明萌 ","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"的直播间充盈着","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":" 擎天水柱","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"，60秒后自动吐泡，点击快去蹭泡吧 ~","fontColor":"#ff5959"}]]><![JSON[{"image":"https://cdn.kascend.com/jellyfish/icon/bang/level_5.5_n_c.png","type":2}]]>', "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": '<![JSON[{"type":1,"content":"我有颜色","fontColor":"#ff4242"}]]>', "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": '<![JSON[{"type":1,"content":"我有颜色[1_石化]","fontColor":"#ff4242"}]]>', "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },
            { "metaInfo": { "showAvatar": false }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 1, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 }


        ];
        this.buffer = [


        ];
        var self = this;
        setInterval(function() {
            if (self.buffer.length < 100) {
                var s = Math.floor(Math.random() * a.length);
                var m = a.slice(0, s);
                self.receiveMessages(m);
            }
        }, 800)

    }
}
/**
普通弹幕：{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705}

表情弹幕：{"createdTime":1539673235865,"roomId":20185,"content":"那这个是第二把还是第一把[1_石化]我就睡了这么一会么？","user":{"nickname":"‎焦糖布丁🍹","avatar":"https://kascdn.kascend.com/jellyfish/avatar/1318202345/1538114430708.jpg!jellyfishavatar","uid":1318202345,"gender":"female"},"recOnly":0,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/38@3x.png"},{"url":"https://cdn.kascend.com/jellyfish/medal/default/6/manager_1.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_13_6.png"}],"metaInfo":{"showAvatar":false},"id":23438334,"type":1}

颜色弹幕：{id: 5333, roomId: 1023, type: 1, user: {uid: 169,…}, createdTime: 1539675601182, metaInfo: {,…},…}
content: "<![JSON[{"type":1,"content":"3123123123[1_加油]","fontColor":"#ff4242"}]]>"
createdTime: 1539675601182
id: 5333
medalList: [{url: "https://cdn.kascend.com/jellyfish/medal/default/6/2017_king_charge4.png"},…]
metaInfo: {,…}
recOnly: 0
roomId: 1023
type: 1
user: {uid: 169,…}

 连击动画
  { "metaInfo": { "additionType": 2, "animation": 5, "animationBg": "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png", "animationIcon": "https://kascdn.kascend.com/jellyfish/gift/v4/225_animation.gif", "animationPriority": 20, "animationSwfName": "WishCrystalGift", "animationText": '<![JSON[{"fontSizeLevel":4,"type":1,"content":" 清の酒 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 包子包子包肉肉 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"许愿水晶 30连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#ffffff"}]]>' }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 2, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": "太吃装备了这个英雄[1_石化]", "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 }

喇叭
 { "metaInfo": { "additionType": 2 }, "user": { "uid": 1192671307, "avatar": "https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG", "gender": "male", "nickname": "‎Ꮺ゛浮华" }, "type": 2, "medalList": [{ "url": "https://kascdn.kascend.com/jellyfish/user/level/39@3x.png" }, { "url": "https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png" }], "content": '<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"type":1,"content":"主播 ","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":"聪明萌 ","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"的直播间充盈着","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":" 擎天水柱","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"，60秒后自动吐泡，点击快去蹭泡吧 ~","fontColor":"#ff5959"}]]><![JSON[{"image":"https://cdn.kascend.com/jellyfish/icon/bang/level_5.5_n_c.png","type":2}]]>', "roomId": 20185, "recOnly": 0, "createdTime": 1539671956749, "id": 23400705 },

入场欢迎：
{id: 4815, roomId: 2002590, type: 4, user: {uid: -1, avatar: "", gender: "", nickname: "‎"},…}
content: "<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_entrance_announce_novice.png","type":2}]]><![JSON[{"type":1,"content":"欢迎新宝宝 ","fontColor":"#1c2229"}]]><![JSON[{"style":1,"type":1,"content":"nrrdr8","fontColor":"#1c2229"}]]>"
createdTime: 1539686968206
id: 4815
medalList: []
recOnly: 0
roomId: 2002590
type: 4
user: {uid: -1, avatar: "", gender: "", nickname: "‎"}
**/
// <![JSON[{"type":1,"content":"1","fontColor":"#ff4242"}]]>