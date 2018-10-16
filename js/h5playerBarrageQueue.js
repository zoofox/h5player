/**
 * 直播弹幕队列
 */
function h5playerBarrageQueue(callback){
	this.buffer = [];
	this.init(callback);
}
h5playerBarrageQueue.prototype = {
	init:function(callback){
		this.fatedata();
		callback(this);
	},
	isEmpty:function(){
		return this.buffer.length == 0?true:false;
	},
	clearBuffer:function(){
		this.buffer = [];
	}
	,
	getBufferLen:function(){
		return this.buffer.length;
	},
	inQueue:function(barrages){
		this.buffer.push(barrages);
	},
	outQueue:function(length){
		var bufferLength = this.getBufferLen();
		if(length <= bufferLength){
			this.buffer.splice(0,length);
		}else{
			this.buffer = [];
			h5playerLog('barrage buffer length less than delete length!',3);
		}
	},
	//1聊天 2系统 3礼物
	receiveMessages:function(messages){
		console.log(messages)
		var messagesLength = messages.length;
		var tempBuffer = [];
		for(var i=0;i<messagesLength;i++){
			var type = messages[i].type;
			var barrageContent = this.takeOffContentShell(type, messages[i].content);
			var transContent = this.translateEmoji(barrageContent);
			
			switch(type){
				case 1:
					tempBuffer.push({
						content:transContent,
						uid:messages[i].uid,
						type:type
					});
					break;
				case 2:
					break;
				case 3:
					break;
				case 4:
					break;
			}
		}
		this.buffer = this.buffer.concat(tempBuffer);
		console.log(this.buffer)

	},
	takeOffContentShell:function(type,content){
		if(content.indexOf('<![JSON[') == 0 && content.indexOf(']]>' > -1)){
			return  JSON.parse(content.slice(8,-3));
		};
		return {
			content:content,
			fontColor:''
		};
	},
	//contentFate用于计算弹幕长度
	translateEmoji:function(content){
		var contentStr = content.content;
		if (contentStr.indexOf("[") != -1 && contentStr.indexOf("]") != -1){
           content.content = CSEmoji.trans(contentStr);
           content.contentFate = this.replaceEmojiText(contentStr);
		}else{
			content.contentFate = contentStr;
		}
        return content;
	},
	//替换contentFate中表情为CS，用以减小弹幕长度
	replaceEmojiText:function(str){
		var emojistr = str.match(/\[(\S*)\]/);
		var reg = /\d_\S*/;
		try{
			if(reg.test(emojistr[0])){
				return str.replace(emojistr[0],'CS');
			}
		}catch(e){
			return str;
		}
		return str;
	}
	,
	fatedata:function(){
		var a =  [
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄[1_石化]","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":'<![JSON[{"type":1,"content":"我有颜色","fontColor":"#ff4242"}]]>',"roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":'<![JSON[{"type":1,"content":"我有颜色[1_石化]","fontColor":"#ff4242"}]]>',"roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄[1_石化]","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄[1_石化]","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄[1_石化]","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄[1_石化]","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705},
			{"metaInfo":{"showAvatar":false},"user":{"uid":1192671307,"avatar":"https://kascdn.kascend.com/jellyfish/avatar/1192671307/1507997225913.JPG","gender":"male","nickname":"‎Ꮺ゛浮华"},"type":1,"medalList":[{"url":"https://kascdn.kascend.com/jellyfish/user/level/39@3x.png"},{"url":"https://kascdn.kascend.com/jellyfish/bigfans/online/20185/20185_10_6.png"}],"content":"太吃装备了这个英雄[1_石化]","roomId":20185,"recOnly":0,"createdTime":1539671956749,"id":23400705}
			
		];
		this.buffer = [
		
	
		];
		var self = this;
		setInterval(function(){
			if(self.buffer.length  < 100){
				var s = Math.floor(Math.random()*a.length);
				var m = a.slice(0,s);
				self.receiveMessages(m);
			}
		},800)

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
**/
// <![JSON[{"type":1,"content":"1","fontColor":"#ff4242"}]]>





