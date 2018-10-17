/**
 * 直播弹幕队列
 * 分发处理弹幕消息（普通弹幕，连击动画，喇叭）
 */
function h5playerBarrageQueue(params, callback) {
    this.buffer = [];
    this.barrage = params.barrage;
    this.barrageFlySpeed = params.barrageFlySpeed;
    this.comboBuffer = [];
    this.init(callback);
}
h5playerBarrageQueue.prototype = {
    init: function(callback) {
        this.initGiftcomboAnimation();
        this.fatedata();
        callback(this);
    },
    initGiftcomboAnimation: function() {
        var self = this;
        new h5playerGiftcomboAnimation(this, function(giftcombo) {
            self.giftcombo = giftcombo;
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
    //1聊天 2喇叭/连击动画 3礼物 4进场关注等系统消息
    receiveMessages: function(messages) {
        var messagesLength = messages.length;
        var tempBuffer = [];
        for (var i = 0; i < messagesLength; i++) {
            var type = messages[i].type;
            switch (type) {
                case 1:
                    var barrageContent = this.takeOffContentShell(messages[i].content);
                    var transContent = this.translateEmoji(barrageContent);
                    tempBuffer.push({
                        content: transContent,
                        uid: messages[i].uid,
                        type: type
                    });
                    break;
                case 2:
                    if (messages[i].metaInfo && messages[i].metaInfo.animation == 5) {
                        //连击动画
                        this.comboAnimation(messages[i].metaInfo);
                    } else {
                        //喇叭
                        this.systemMsg(messages[i].content);
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
    /*
    additionType: 2
    animation: 5
    animationBg: "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png"
    animationIcon: "https://kascdn.kascend.com/jellyfish/gift/v4/231_animation.gif"
    animationPriority: 20
    animationSwfName: "WishCrystalGift"
    animationText: "<![JSON[{"fontSizeLevel":4,"type":1,"content":" 清の酒 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 包子包子包肉肉 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"许愿水晶 30连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#ffffff"}]]>"
     */
    comboAnimation: function(metaInfo) {
        if (this.giftcombo) {
            var animationIcon = metaInfo.animationIcon;
            var giftId = animationIcon.match(/v4\/(\S*)_/)[1];
            var combotext = this.reformContent(metaInfo.animationText);
            this.giftcombo.handOver({
            	giftId:giftId,
            	combotext:combotext,
            	icon:animationIcon
            }); //queue只负责分发，不负责具体动画业务
        }
    },
    //喇叭
    /*
    <![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"type":1,"content":"主播 ","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":"聪明萌 ","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"的直播间充盈着","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":" 擎天水柱","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"，60秒后自动吐泡，点击快去蹭泡吧 ~","fontColor":"#ff5959"}]]><![JSON[{"image":"https://cdn.kascend.com/jellyfish/icon/bang/level_5.5_n_c.png","type":2}]]>
     */
    systemMsg: function(content) {

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
系统消息：
{id: 2213, roomId: -41, type: 2, user: {uid: -1, avatar: "", gender: "", nickname: "‎"},…}
content: "<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat/chat_icon_gift_v1.png","type":2}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 白起的宝贝石头 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"送给","fontColor":"#228FBD"}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 梵叶 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"海星","fontColor":"#228FBD"}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 666 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"连击，","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"对主播的钦佩犹如滔滔江水连绵不绝。","fontColor":"#228FBD"}]]>"
createdTime: 1539686777065
id: 2213
medalList: []
metaInfo: {filter: true, broadcastExtraMetaInfo: {roomId: 16079005, extraMetaInfo: {,…}}, additionType: 2}
additionType: 2
broadcastExtraMetaInfo: {roomId: 16079005, extraMetaInfo: {,…}}
extraMetaInfo: {,…}
animation: 5
animationBg: "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png"
animationIcon: "https://kascdn.kascend.com/jellyfish/gift/v4/5_animation.gif"
animationPriority: 20
animationSwfName: "Starfish"
animationText: "<![JSON[{"fontSizeLevel":4,"type":1,"content":" 白起的宝贝石头 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 梵叶 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"海星 666连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"对主播的钦佩犹如滔滔江水连绵不绝。","fontColor":"#ffffff"}]]>"
roomId: 16079005
filter: true
recOnly: 0
roomId: -41
type: 2
user: {uid: -1, avatar: "", gender: "", nickname: "‎"}

 {id: 2218, roomId: -41, type: 2, user: {uid: -1, avatar: "", gender: "", nickname: "‎"},…}
content: "<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat/chat_icon_gift_v1.png","type":2}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 仙女不生氣 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"送给","fontColor":"#228FBD"}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 一哲欧巴！ ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"许愿水晶","fontColor":"#228FBD"}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 30 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"连击，","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#228FBD"}]]>"
createdTime: 1539686964923
id: 2218
medalList: []
metaInfo: {,…}
additionType: 2
animation: 5
animationBg: "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png"
animationIcon: "https://kascdn.kascend.com/jellyfish/gift/v4/231_animation.gif"
animationPriority: 20
animationSwfName: "WishCrystalGift"
animationText: "<![JSON[{"fontSizeLevel":4,"type":1,"content":" 仙女不生氣 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 一哲欧巴！ ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"许愿水晶 30连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#ffffff"}]]>"
filter: true
recOnly: 0
roomId: -41
type: 2
user: {uid: -1, avatar: "", gender: "", nickname: "‎"}
avatar: ""
gender: ""
nickname: "‎"
uid: -1


喇叭
content: "<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"type":1,"content":"主播 ","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":"聪明萌 ","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"的直播间充盈着","fontColor":"#ff5959"}]]><![JSON[{"style":1,"type":1,"content":" 擎天水柱","fontColor":"#ffbd00"}]]><![JSON[{"type":1,"content":"，60秒后自动吐泡，点击快去蹭泡吧 ~","fontColor":"#ff5959"}]]><![JSON[{"image":"https://cdn.kascend.com/jellyfish/icon/bang/level_5.5_n_c.png","type":2}]]>"
createdTime: 1539687577766
id: 2224
medalList: []
metaInfo: {nav: {type: 1, targetKey: "24506808"}, liveType: 1}
liveType: 1
nav: {type: 1, targetKey: "24506808"}
targetKey: "24506808"
type: 1
recOnly: 0
roomId: -41
type: 2
user: {uid: -1, avatar: "", gender: "", nickname: "‎"}

连击动画
{id: 2231, roomId: -41, type: 2, user: {uid: -1, avatar: "", gender: "", nickname: "‎"},…}
content: "<![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat_icon_alarm_v4.png","type":2}]]><![JSON[{"image":"https://kascdn.kascend.com/jellyfish/chat/chat_icon_gift_v1.png","type":2}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 清の酒 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"送给","fontColor":"#228FBD"}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 包子包子包肉肉 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"许愿水晶","fontColor":"#228FBD"}]]><![JSON[{"fontSizeLevel":2,"style":1,"type":1,"content":" 30 ","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"连击，","fontColor":"#228FBD"}]]><![JSON[{"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#228FBD"}]]>"
createdTime: 1539687826527
id: 2231
medalList: []
metaInfo: {,…}
additionType: 2
animation: 5
animationBg: "https://kascdn.kascend.com/jellyfish/gift/v4/gift_combo_animation_bg_v2.png"
animationIcon: "https://kascdn.kascend.com/jellyfish/gift/v4/231_animation.gif"
animationPriority: 20
animationSwfName: "WishCrystalGift"
animationText: "<![JSON[{"fontSizeLevel":4,"type":1,"content":" 清の酒 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"送给","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":" 包子包子包肉肉 ","fontColor":"#ffe345"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"许愿水晶 30连击，","fontColor":"#ffffff"}]]><![JSON[{"fontSizeLevel":4,"type":1,"content":"触海欧气爆棚，祝你心想事成！","fontColor":"#ffffff"}]]>"
filter: true
recOnly: 0
roomId: -41
type: 2
user: {uid: -1, avatar: "", gender: "", nickname: "‎"}



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